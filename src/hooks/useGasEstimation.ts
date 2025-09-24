'use client';

import { useState, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Contract, parseUnits, formatUnits } from 'ethers';

interface GasEstimate {
  estimatedGas: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCostETH: string;
  estimatedCostUSD?: string;
}

interface GasOptions {
  speed: 'slow' | 'standard' | 'fast';
  customGasPrice?: string;
  customGasLimit?: string;
}

export function useGasEstimation() {
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { provider, cvRegistryContract } = useWeb3();

  const getGasPrices = useCallback(async () => {
    if (!provider) throw new Error('Provider not available');

    try {
      const feeData = await provider.getFeeData();

      // For EIP-1559 networks
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        return {
          slow: {
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * BigInt(8) / BigInt(10), // 80% of suggested
          },
          standard: {
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          },
          fast: {
            maxFeePerGas: feeData.maxFeePerGas * BigInt(12) / BigInt(10), // 120% of suggested
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * BigInt(12) / BigInt(10),
          }
        };
      }

      // For legacy networks
      const gasPrice = feeData.gasPrice || parseUnits('20', 'gwei');
      return {
        slow: { gasPrice: gasPrice * BigInt(8) / BigInt(10) },
        standard: { gasPrice },
        fast: { gasPrice: gasPrice * BigInt(12) / BigInt(10) }
      };

    } catch (error) {
      console.error('Failed to get gas prices:', error);
      // Fallback gas prices
      const fallbackGasPrice = parseUnits('20', 'gwei');
      return {
        slow: { gasPrice: fallbackGasPrice * BigInt(8) / BigInt(10) },
        standard: { gasPrice: fallbackGasPrice },
        fast: { gasPrice: fallbackGasPrice * BigInt(12) / BigInt(10) }
      };
    }
  }, [provider]);

  const estimateContractTransaction = useCallback(async (
    contractMethod: string,
    args: any[],
    options: GasOptions = { speed: 'standard' }
  ): Promise<GasEstimate> => {
    if (!provider || !cvRegistryContract) {
      throw new Error('Web3 not initialized');
    }

    setIsEstimating(true);
    setError(null);

    try {
      // Get contract method
      const method = cvRegistryContract.getFunction(contractMethod);

      // Estimate gas limit
      let estimatedGas: bigint;
      try {
        estimatedGas = await cvRegistryContract[contractMethod].estimateGas(...args);
        // Add 20% buffer for safety
        estimatedGas = estimatedGas * BigInt(12) / BigInt(10);
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError);
        // Default gas limits for different operations
        const defaultGasLimits = {
          submitCV: BigInt(150000),
          updateCV: BigInt(120000),
          approveCV: BigInt(80000),
          rejectCV: BigInt(80000)
        };
        estimatedGas = BigInt(defaultGasLimits[contractMethod as keyof typeof defaultGasLimits] || 200000);
      }

      // Get gas prices
      const gasPrices = await getGasPrices();
      const selectedSpeed = gasPrices[options.speed];

      let gasPrice: bigint;
      let maxFeePerGas: bigint | undefined;
      let maxPriorityFeePerGas: bigint | undefined;

      if ('maxFeePerGas' in selectedSpeed) {
        maxFeePerGas = selectedSpeed.maxFeePerGas;
        maxPriorityFeePerGas = selectedSpeed.maxPriorityFeePerGas;
        gasPrice = selectedSpeed.maxFeePerGas!; // Non-null assertion since we checked above
      } else {
        gasPrice = selectedSpeed.gasPrice;
      }

      // Apply custom gas settings if provided
      if (options.customGasPrice) {
        gasPrice = parseUnits(options.customGasPrice, 'gwei');
      }

      if (options.customGasLimit) {
        estimatedGas = BigInt(options.customGasLimit);
      }

      // Calculate estimated cost in ETH
      const estimatedCostWei = estimatedGas * gasPrice;
      const estimatedCostETH = formatUnits(estimatedCostWei, 'ether');

      // Try to get ETH price for USD estimation
      let estimatedCostUSD: string | undefined;
      try {
        const ethPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const ethPriceData = await ethPriceResponse.json();
        const ethPriceUSD = ethPriceData.ethereum?.usd || 2000; // Fallback price
        estimatedCostUSD = (parseFloat(estimatedCostETH) * ethPriceUSD).toFixed(2);
      } catch (priceError) {
        console.warn('Failed to get ETH price:', priceError);
      }

      const estimate: GasEstimate = {
        estimatedGas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        estimatedCostETH,
        estimatedCostUSD
      };

      setGasEstimate(estimate);
      return estimate;

    } catch (error: any) {
      const errorMessage = error.message || 'Gas estimation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsEstimating(false);
    }
  }, [provider, cvRegistryContract, getGasPrices]);

  const estimateSubmitCV = useCallback((
    ipfsHash: string,
    metadataHash: string,
    options?: GasOptions
  ) => estimateContractTransaction('submitCV', [ipfsHash, metadataHash], options), [estimateContractTransaction]);

  const estimateUpdateCV = useCallback((
    ipfsHash: string,
    metadataHash: string,
    options?: GasOptions
  ) => estimateContractTransaction('updateCV', [ipfsHash, metadataHash], options), [estimateContractTransaction]);

  const estimateApproveCV = useCallback((
    userAddress: string,
    options?: GasOptions
  ) => estimateContractTransaction('approveCV', [userAddress], options), [estimateContractTransaction]);

  const estimateRejectCV = useCallback((
    userAddress: string,
    reason: string,
    options?: GasOptions
  ) => estimateContractTransaction('rejectCV', [userAddress, reason], options), [estimateContractTransaction]);

  const buildTransactionOptions = useCallback((
    estimate: GasEstimate,
    options: GasOptions = { speed: 'standard' }
  ) => {
    const txOptions: any = {
      gasLimit: estimate.estimatedGas.toString()
    };

    if (estimate.maxFeePerGas && estimate.maxPriorityFeePerGas) {
      // EIP-1559 transaction
      txOptions.maxFeePerGas = estimate.maxFeePerGas.toString();
      txOptions.maxPriorityFeePerGas = estimate.maxPriorityFeePerGas.toString();
    } else {
      // Legacy transaction
      txOptions.gasPrice = estimate.gasPrice.toString();
    }

    // Apply custom overrides
    if (options.customGasPrice) {
      if (estimate.maxFeePerGas) {
        txOptions.maxFeePerGas = parseUnits(options.customGasPrice, 'gwei').toString();
      } else {
        txOptions.gasPrice = parseUnits(options.customGasPrice, 'gwei').toString();
      }
    }

    if (options.customGasLimit) {
      txOptions.gasLimit = options.customGasLimit;
    }

    return txOptions;
  }, []);

  const clearEstimate = useCallback(() => {
    setGasEstimate(null);
    setError(null);
  }, []);

  return {
    // State
    gasEstimate,
    isEstimating,
    error,

    // Methods
    estimateSubmitCV,
    estimateUpdateCV,
    estimateApproveCV,
    estimateRejectCV,
    estimateContractTransaction,
    buildTransactionOptions,
    getGasPrices,
    clearEstimate,

    // Utilities
    formatGasPrice: (gasPrice: bigint) => formatUnits(gasPrice, 'gwei'),
    formatEther: (wei: bigint) => formatUnits(wei, 'ether'),
    parseGwei: (gwei: string) => parseUnits(gwei, 'gwei')
  };
}