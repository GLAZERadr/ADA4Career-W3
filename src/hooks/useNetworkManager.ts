'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import {
  SUPPORTED_NETWORKS,
  DEFAULT_NETWORK_ID,
  getNetworkConfig,
  isNetworkSupported,
  buildAddNetworkParams,
  formatChainId,
  type ExtendedNetworkConfig
} from '@/config/networks';

export function useNetworkManager() {
  const [targetNetwork, setTargetNetwork] = useState<number>(DEFAULT_NETWORK_ID);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const { chainId, provider } = useWeb3();

  const currentNetwork = chainId ? getNetworkConfig(chainId) : null;
  const isOnSupportedNetwork = chainId ? isNetworkSupported(chainId) : false;
  const isOnTargetNetwork = chainId === targetNetwork;

  // Check if user is on the wrong network
  const needsNetworkSwitch = !isOnSupportedNetwork || !isOnTargetNetwork;

  useEffect(() => {
    // Clear error when network changes
    if (chainId) {
      setSwitchError(null);
    }
  }, [chainId]);

  const switchToNetwork = useCallback(async (networkId: number): Promise<boolean> => {
    if (!provider || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    const network = getNetworkConfig(networkId);
    if (!network) {
      throw new Error(`Unsupported network: ${networkId}`);
    }

    setIsSwitching(true);
    setSwitchError(null);
    setTargetNetwork(networkId);

    try {
      // First, try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: formatChainId(networkId) }]
      });

      return true;

    } catch (error: any) {
      console.error('Network switch error:', error);

      // Error code 4902 means the network isn't added to MetaMask yet
      if (error.code === 4902) {
        try {
          // Add the network to MetaMask
          const networkParams = buildAddNetworkParams(networkId);

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams]
          });

          return true;

        } catch (addError: any) {
          console.error('Failed to add network:', addError);
          setSwitchError(`Failed to add ${network.name} to wallet: ${addError.message}`);
          return false;
        }
      } else if (error.code === 4001) {
        // User rejected the request
        setSwitchError('Network switch was rejected by user');
        return false;
      } else {
        setSwitchError(`Failed to switch to ${network.name}: ${error.message}`);
        return false;
      }
    } finally {
      setIsSwitching(false);
    }
  }, [provider]);

  const switchToLiskSepolia = useCallback(() => switchToNetwork(4202), [switchToNetwork]);
  const switchToLiskMainnet = useCallback(() => switchToNetwork(1135), [switchToNetwork]);
  const switchToEthereumMainnet = useCallback(() => switchToNetwork(1), [switchToNetwork]);
  const switchToEthereumSepolia = useCallback(() => switchToNetwork(11155111), [switchToNetwork]);
  const switchToPolygonMainnet = useCallback(() => switchToNetwork(137), [switchToNetwork]);
  const switchToPolygonMumbai = useCallback(() => switchToNetwork(80001), [switchToNetwork]);

  const getNetworkStatus = useCallback(() => {
    if (!chainId) {
      return {
        status: 'not_connected' as const,
        message: 'Wallet not connected',
        canProceed: false
      };
    }

    if (!isNetworkSupported(chainId)) {
      return {
        status: 'unsupported' as const,
        message: `Unsupported network. Please switch to a supported network.`,
        canProceed: false
      };
    }

    const network = getNetworkConfig(chainId);
    const hasContract = network?.contractAddresses.cvRegistry;

    if (!hasContract) {
      return {
        status: 'no_contract' as const,
        message: `CV Registry contract not deployed on ${network?.name}`,
        canProceed: false
      };
    }

    if (chainId !== targetNetwork) {
      const targetNetworkConfig = getNetworkConfig(targetNetwork);
      return {
        status: 'wrong_network' as const,
        message: `Please switch to ${targetNetworkConfig?.name} to continue`,
        canProceed: false
      };
    }

    return {
      status: 'correct' as const,
      message: `Connected to ${network?.name}`,
      canProceed: true
    };
  }, [chainId, targetNetwork]);

  const getSupportedNetworksWithContracts = useCallback(() => {
    return Object.values(SUPPORTED_NETWORKS).filter(
      network => network.contractAddresses.cvRegistry
    );
  }, []);

  const clearError = useCallback(() => {
    setSwitchError(null);
  }, []);

  const setPreferredNetwork = useCallback((networkId: number) => {
    if (!isNetworkSupported(networkId)) {
      throw new Error(`Network ${networkId} is not supported`);
    }
    setTargetNetwork(networkId);
  }, []);

  return {
    // Current state
    currentNetwork,
    targetNetwork,
    chainId,
    isOnSupportedNetwork,
    isOnTargetNetwork,
    needsNetworkSwitch,
    isSwitching,
    switchError,

    // Network switching
    switchToNetwork,
    switchToLiskSepolia,
    switchToLiskMainnet,
    switchToEthereumMainnet,
    switchToEthereumSepolia,
    switchToPolygonMainnet,
    switchToPolygonMumbai,

    // Utilities
    getNetworkStatus,
    getSupportedNetworksWithContracts,
    setPreferredNetwork,
    clearError,

    // Constants
    SUPPORTED_NETWORKS,
    DEFAULT_NETWORK_ID
  };
}