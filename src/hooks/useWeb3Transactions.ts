'use client';

import { useState, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { TransactionStatus } from '@/types/web3.types';

export function useWeb3Transactions() {
  const [transactions, setTransactions] = useState<Map<string, TransactionStatus>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const { provider } = useWeb3();

  const addTransaction = useCallback((hash: string) => {
    setTransactions(prev => new Map(prev.set(hash, {
      hash,
      status: 'pending',
      confirmations: 0
    })));
  }, []);

  const updateTransactionStatus = useCallback((hash: string, status: TransactionStatus['status']) => {
    setTransactions(prev => {
      const newMap = new Map(prev);
      const tx = newMap.get(hash);
      if (tx) {
        newMap.set(hash, { ...tx, status });
      }
      return newMap;
    });
  }, []);

  const waitForTransaction = useCallback(async (txHash: string): Promise<void> => {
    if (!provider) {
      throw new Error('Provider not available');
    }

    addTransaction(txHash);

    try {
      const receipt = await provider.waitForTransaction(txHash, 1);

      if (receipt) {
        updateTransactionStatus(txHash, receipt.status === 1 ? 'confirmed' : 'failed');
      } else {
        updateTransactionStatus(txHash, 'failed');
      }
    } catch (error) {
      updateTransactionStatus(txHash, 'failed');
      throw error;
    }
  }, [provider, addTransaction, updateTransactionStatus]);

  const executeTransaction = useCallback(async <T>(
    transactionFn: () => Promise<T>,
    description?: string
  ): Promise<T> => {
    setIsProcessing(true);

    try {
      const result = await transactionFn();

      // If result is a transaction hash, wait for it
      if (typeof result === 'string' && result.startsWith('0x')) {
        await waitForTransaction(result);
      }

      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [waitForTransaction]);

  const getTransaction = useCallback((hash: string): TransactionStatus | undefined => {
    return transactions.get(hash);
  }, [transactions]);

  const clearTransactions = useCallback(() => {
    setTransactions(new Map());
  }, []);

  return {
    transactions: Array.from(transactions.values()),
    isProcessing,
    executeTransaction,
    waitForTransaction,
    getTransaction,
    clearTransactions,
    addTransaction
  };
}