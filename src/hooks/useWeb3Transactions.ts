'use client';

import { useState, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { TransactionStatus } from '@/types/web3.types';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
}

interface TransactionOptions {
  retry?: RetryConfig;
  timeout?: number;
  description?: string;
  onProgress?: (status: string) => void;
}

interface EnhancedTransactionStatus extends TransactionStatus {
  attempts?: number;
  lastError?: string;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 2000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryCondition: (error) => {
    // Retry on network errors, not on revert errors
    const message = error?.message?.toLowerCase() || '';
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('underpriced') ||
      message.includes('replacement transaction underpriced') ||
      error?.code === 'NETWORK_ERROR' ||
      error?.code === 'TIMEOUT'
    );
  }
};

export function useWeb3Transactions() {
  const [transactions, setTransactions] = useState<Map<string, EnhancedTransactionStatus>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const { provider } = useWeb3();

  const addTransaction = useCallback((hash: string, attempts: number = 1) => {
    setTransactions(prev => new Map(prev.set(hash, {
      hash,
      status: 'pending',
      confirmations: 0,
      attempts
    })));
  }, []);

  const updateTransactionStatus = useCallback((
    hash: string,
    updates: Partial<EnhancedTransactionStatus>
  ) => {
    setTransactions(prev => {
      const newMap = new Map(prev);
      const tx = newMap.get(hash);
      if (tx) {
        newMap.set(hash, { ...tx, ...updates });
      }
      return newMap;
    });
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const waitForTransaction = useCallback(async (
    txHash: string,
    confirmations: number = 1,
    timeout: number = 300000 // 5 minutes default
  ): Promise<void> => {
    if (!provider) {
      throw new Error('Provider not available');
    }

    addTransaction(txHash);

    try {
      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Transaction timeout')), timeout);
      });

      // Wait for transaction with timeout
      const receiptPromise = provider.waitForTransaction(txHash, confirmations);
      const receipt = await Promise.race([receiptPromise, timeoutPromise]);

      if (receipt) {
        updateTransactionStatus(txHash, {
          status: receipt.status === 1 ? 'confirmed' : 'failed',
          confirmations: 1, // We waited for 1 confirmation
          gasUsed: receipt.gasUsed,
          effectiveGasPrice: receipt.gasPrice
        });

        if (receipt.status !== 1) {
          throw new Error('Transaction reverted');
        }
      } else {
        updateTransactionStatus(txHash, { status: 'failed', lastError: 'No receipt received' });
        throw new Error('Transaction failed - no receipt');
      }
    } catch (error: any) {
      updateTransactionStatus(txHash, {
        status: 'failed',
        lastError: error.message
      });
      throw error;
    }
  }, [provider, addTransaction, updateTransactionStatus]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> => {
    let lastError: any;
    let delay = config.initialDelay;

    for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
      try {
        const result = await operation();

        // If it's a transaction hash, update the attempt count
        if (typeof result === 'string' && result.startsWith('0x')) {
          updateTransactionStatus(result as string, { attempts: attempt });
        }

        return result;
      } catch (error: any) {
        lastError = error;

        // Don't retry if it's the last attempt
        if (attempt === config.maxRetries + 1) {
          break;
        }

        // Check if we should retry this error
        if (config.retryCondition && !config.retryCondition(error)) {
          throw error;
        }

        console.warn(`Transaction attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);

        // Wait before retrying
        await sleep(delay);

        // Increase delay with backoff, but cap at maxDelay
        delay = Math.min(delay * config.backoffFactor, config.maxDelay);
      }
    }

    // If we get here, all retries failed
    throw new Error(`Transaction failed after ${config.maxRetries + 1} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
  }, [updateTransactionStatus]);

  const executeTransaction = useCallback(async <T>(
    transactionFn: () => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> => {
    const {
      retry = DEFAULT_RETRY_CONFIG,
      timeout = 300000, // 5 minutes
      description = 'Transaction',
      onProgress
    } = options;

    setIsProcessing(true);
    setCurrentOperation(description);

    try {
      onProgress?.('Preparing transaction...');

      // Execute transaction with retry logic
      const result = await executeWithRetry(transactionFn, retry);

      // If result is a transaction hash, wait for confirmation
      if (typeof result === 'string' && result.startsWith('0x')) {
        onProgress?.('Transaction submitted, waiting for confirmation...');
        await waitForTransaction(result, 1, timeout);
        onProgress?.('Transaction confirmed!');
      }

      return result;
    } catch (error: any) {
      onProgress?.(`Transaction failed: ${error.message}`);
      throw error;
    } finally {
      setIsProcessing(false);
      setCurrentOperation('');
    }
  }, [executeWithRetry, waitForTransaction]);

  const speedUpTransaction = useCallback(async (
    originalTxHash: string,
    newGasPrice: bigint
  ): Promise<string> => {
    if (!provider) {
      throw new Error('Provider not available');
    }

    try {
      // Get the original transaction
      const originalTx = await provider.getTransaction(originalTxHash);
      if (!originalTx) {
        throw new Error('Original transaction not found');
      }

      // Create a new transaction with higher gas price and same nonce
      const speedUpTx = {
        to: originalTx.to,
        value: originalTx.value,
        data: originalTx.data,
        gasLimit: originalTx.gasLimit,
        gasPrice: newGasPrice,
        nonce: originalTx.nonce
      };

      // Get signer and send transaction
      const signer = await provider.getSigner();
      const newTx = await signer.sendTransaction(speedUpTx);

      // Update the original transaction status
      updateTransactionStatus(originalTxHash, {
        status: 'pending',
        lastError: 'Replaced by speed-up transaction'
      });

      // Add the new transaction
      addTransaction(newTx.hash);

      return newTx.hash;
    } catch (error: any) {
      throw new Error(`Failed to speed up transaction: ${error.message}`);
    }
  }, [provider, addTransaction, updateTransactionStatus]);

  const cancelTransaction = useCallback(async (
    originalTxHash: string
  ): Promise<string> => {
    if (!provider) {
      throw new Error('Provider not available');
    }

    try {
      // Get the original transaction
      const originalTx = await provider.getTransaction(originalTxHash);
      if (!originalTx) {
        throw new Error('Original transaction not found');
      }

      // Create a 0 ETH transaction to self with higher gas price and same nonce
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const cancelTx = {
        to: signerAddress,
        value: 0,
        gasLimit: 21000, // Standard transfer gas
        gasPrice: originalTx.gasPrice ? originalTx.gasPrice * BigInt(11) / BigInt(10) : undefined, // 10% higher
        nonce: originalTx.nonce
      };

      const newTx = await signer.sendTransaction(cancelTx);

      // Update the original transaction status
      updateTransactionStatus(originalTxHash, {
        status: 'failed',
        lastError: 'Cancelled by user'
      });

      return newTx.hash;
    } catch (error: any) {
      throw new Error(`Failed to cancel transaction: ${error.message}`);
    }
  }, [provider, updateTransactionStatus]);

  const getTransaction = useCallback((hash: string): EnhancedTransactionStatus | undefined => {
    return transactions.get(hash);
  }, [transactions]);

  const clearTransactions = useCallback(() => {
    setTransactions(new Map());
  }, []);

  const getPendingTransactions = useCallback(() => {
    return Array.from(transactions.values()).filter(tx => tx.status === 'pending');
  }, [transactions]);

  const getFailedTransactions = useCallback(() => {
    return Array.from(transactions.values()).filter(tx => tx.status === 'failed');
  }, [transactions]);

  return {
    // State
    transactions: Array.from(transactions.values()),
    isProcessing,
    currentOperation,

    // Core methods
    executeTransaction,
    waitForTransaction,
    addTransaction,

    // Transaction management
    speedUpTransaction,
    cancelTransaction,

    // Query methods
    getTransaction,
    getPendingTransactions,
    getFailedTransactions,

    // Utility methods
    clearTransactions,
    updateTransactionStatus,

    // Configuration
    DEFAULT_RETRY_CONFIG
  };
}