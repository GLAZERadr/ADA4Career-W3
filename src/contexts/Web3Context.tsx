'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner, Contract } from 'ethers';

import { CVRegistry } from '@/types/web3.types';

// Web3 State Interface
interface Web3State {
  // Wallet Connection
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;

  // Contract
  cvRegistryContract: Contract | null;

  // UI States
  isConnecting: boolean;
  error: string | null;

  // CV Status
  cvStatus: 'None' | 'Pending' | 'Approved' | 'Rejected' | null;
  cvRecord: CVRegistry.CVRecord | null;
}

// Web3 Actions
type Web3Action =
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: { account: string; chainId: number; provider: BrowserProvider; signer: JsonRpcSigner } }
  | { type: 'SET_DISCONNECTED' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_CONTRACT'; payload: Contract }
  | { type: 'SET_CV_STATUS'; payload: { status: string; record: CVRegistry.CVRecord | null } };

// Initial State
const initialState: Web3State = {
  isConnected: false,
  account: null,
  chainId: null,
  provider: null,
  signer: null,
  cvRegistryContract: null,
  isConnecting: false,
  error: null,
  cvStatus: null,
  cvRecord: null,
};

// Reducer
function web3Reducer(state: Web3State, action: Web3Action): Web3State {
  switch (action.type) {
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload, error: null };

    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: true,
        account: action.payload.account,
        chainId: action.payload.chainId,
        provider: action.payload.provider,
        signer: action.payload.signer,
        isConnecting: false,
        error: null,
      };

    case 'SET_DISCONNECTED':
      return {
        ...initialState,
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isConnecting: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_CONTRACT':
      return { ...state, cvRegistryContract: action.payload };

    case 'SET_CV_STATUS':
      return {
        ...state,
        cvStatus: action.payload.status as Web3State['cvStatus'],
        cvRecord: action.payload.record,
      };

    default:
      return state;
  }
}

// Context Interface
interface Web3ContextType extends Web3State {
  connectWallet: (walletType?: 'metamask' | 'walletconnect') => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  submitCV: (ipfsHash: string, metadataHash: string) => Promise<string>;
  updateCV: (ipfsHash: string, metadataHash: string) => Promise<string>;
  getCVStatus: () => Promise<void>;
  approveCV: (userAddress: string) => Promise<string>;
  rejectCV: (userAddress: string, reason: string) => Promise<string>;
  getPendingCVs: (offset: number, limit: number) => Promise<{users: string[], records: any[]}>;
  clearError: () => void;
}

// Create Context
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Contract Configuration
const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_CV_REGISTRY_ADDRESS || '',
  abi: [
    // Contract ABI will be populated from build artifacts
    "function submitCV(string memory _ipfsHash, string memory _metadataHash) external",
    "function updateCV(string memory _ipfsHash, string memory _metadataHash) external",
    "function approveCV(address _user) external",
    "function rejectCV(address _user, string memory _reason) external",
    "function getPendingCVs(uint256 _offset, uint256 _limit) external view returns (address[] memory users, tuple(string ipfsHash, string metadataHash, uint8 status, uint256 submissionTime, uint256 lastUpdateTime, address submitter, string rejectionReason)[] memory records)",
    "function getCVRecord(address _user) external view returns (tuple(string ipfsHash, string metadataHash, uint8 status, uint256 submissionTime, uint256 lastUpdateTime, address submitter, string rejectionReason))",
    "function getCVStatus(address _user) external view returns (uint8)",
    "function isApprover(address _address) external view returns (bool)",
    "event CVSubmitted(address indexed user, string ipfsHash, string metadataHash, uint256 timestamp)",
    "event CVUpdated(address indexed user, string oldIpfsHash, string newIpfsHash, string newMetadataHash, uint256 timestamp)",
    "event CVApproved(address indexed user, address indexed approver, uint256 timestamp)",
    "event CVRejected(address indexed user, address indexed rejector, string reason, uint256 timestamp)"
  ],
};

const LISK_SEPOLIA_CHAIN_ID = 4202;

// Provider Component
export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(web3Reducer, initialState);

  // Initialize contract when provider and signer are available
  useEffect(() => {
    if (state.provider && state.signer && CONTRACT_CONFIG.address) {
      try {
        const contract = new Contract(
          CONTRACT_CONFIG.address,
          CONTRACT_CONFIG.abi,
          state.signer
        );
        dispatch({ type: 'SET_CONTRACT', payload: contract });
      } catch (error) {
        console.error('Failed to initialize contract:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize smart contract' });
      }
    }
  }, [state.provider, state.signer]);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          dispatch({ type: 'SET_DISCONNECTED' });
        } else if (accounts[0] !== state.account) {
          // Account changed, reconnect
          connectWallet('metamask');
        }
      };

      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        if (newChainId !== LISK_SEPOLIA_CHAIN_ID) {
          dispatch({ type: 'SET_ERROR', payload: 'Please switch to Lisk Sepolia testnet' });
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.account]);

  // Listen for demo events
  useEffect(() => {
    const handleDemoApprove = (event: any) => {
      dispatch({
        type: 'SET_CV_STATUS',
        payload: {
          status: 'Approved',
          record: event.detail.record
        }
      });
    };

    const handleDemoReject = (event: any) => {
      dispatch({
        type: 'SET_CV_STATUS',
        payload: {
          status: 'Rejected',
          record: event.detail.record
        }
      });
    };

    window.addEventListener('demo-cv-approve', handleDemoApprove);
    window.addEventListener('demo-cv-reject', handleDemoReject);

    return () => {
      window.removeEventListener('demo-cv-approve', handleDemoApprove);
      window.removeEventListener('demo-cv-reject', handleDemoReject);
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();

          dispatch({
            type: 'SET_CONNECTED',
            payload: {
              account: accounts[0].address,
              chainId: Number(network.chainId),
              provider,
              signer,
            }
          });
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async (walletType: 'metamask' | 'walletconnect' = 'metamask') => {
    if (walletType !== 'metamask') {
      dispatch({ type: 'SET_ERROR', payload: 'WalletConnect not implemented yet' });
      return;
    }

    dispatch({ type: 'SET_CONNECTING', payload: true });

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const account = await signer.getAddress();

      // Check if we're on Lisk Sepolia
      if (Number(network.chainId) !== LISK_SEPOLIA_CHAIN_ID) {
        await switchNetwork(LISK_SEPOLIA_CHAIN_ID);
        return; // switchNetwork will handle reconnection
      }

      dispatch({
        type: 'SET_CONNECTED',
        payload: {
          account,
          chainId: Number(network.chainId),
          provider,
          signer,
        }
      });

    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to connect wallet'
      });
    }
  };

  const disconnectWallet = () => {
    dispatch({ type: 'SET_DISCONNECTED' });
  };

  const switchNetwork = async (chainId: number) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      // Reconnect after network switch
      await connectWallet('metamask');
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: 'Lisk Sepolia Testnet',
                rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia-blockscout.lisk.com/'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add Lisk Sepolia network');
        }
      } else {
        throw new Error('Failed to switch network');
      }
    }
  };

  const submitCV = async (ipfsHash: string, metadataHash: string): Promise<string> => {
    // Demo mode: simulate submission without actual contract
    if (!state.cvRegistryContract) {
      console.log('Demo mode: Simulating CV submission to blockchain');

      // Simulate transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // Update status to Pending after "submission"
      dispatch({
        type: 'SET_CV_STATUS',
        payload: {
          status: 'Pending',
          record: {
            ipfsHash,
            metadataHash,
            status: 1, // Pending
            submissionTime: Math.floor(Date.now() / 1000),
            lastUpdateTime: Math.floor(Date.now() / 1000),
            submitter: state.account!,
            rejectionReason: ''
          }
        }
      });

      return mockTxHash;
    }

    try {
      const tx = await state.cvRegistryContract.submitCV(ipfsHash, metadataHash);
      await tx.wait();

      // Update CV status after successful submission
      await getCVStatus();

      return tx.hash;
    } catch (error: any) {
      console.error('Error submitting CV:', error);
      throw new Error(error.reason || 'Failed to submit CV to blockchain');
    }
  };

  const updateCV = async (ipfsHash: string, metadataHash: string): Promise<string> => {
    if (!state.cvRegistryContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await state.cvRegistryContract.updateCV(ipfsHash, metadataHash);
      await tx.wait();

      // Update CV status after successful update
      await getCVStatus();

      return tx.hash;
    } catch (error: any) {
      console.error('Error updating CV:', error);
      throw new Error(error.reason || 'Failed to update CV on blockchain');
    }
  };

  const getCVStatus = useCallback(async () => {
    if (!state.account) {
      return;
    }

    // For demo purposes, provide mock data when contract is not available
    if (!state.cvRegistryContract) {
      console.log('No contract available, showing demo CV status');
      dispatch({
        type: 'SET_CV_STATUS',
        payload: {
          status: 'None',
          record: null
        }
      });
      return;
    }

    try {
      const [status, record] = await Promise.all([
        state.cvRegistryContract.getCVStatus(state.account),
        state.cvRegistryContract.getCVRecord(state.account)
      ]);

      const statusMap = ['None', 'Pending', 'Approved', 'Rejected'];

      dispatch({
        type: 'SET_CV_STATUS',
        payload: {
          status: statusMap[Number(status)],
          record: record.status !== 0 ? {
            ipfsHash: record.ipfsHash,
            metadataHash: record.metadataHash,
            status: Number(record.status),
            submissionTime: Number(record.submissionTime),
            lastUpdateTime: Number(record.lastUpdateTime),
            submitter: record.submitter,
            rejectionReason: record.rejectionReason
          } : null
        }
      });
    } catch (error) {
      console.error('Error fetching CV status, falling back to demo data:', error);
      // Fallback to demo data for development
      dispatch({
        type: 'SET_CV_STATUS',
        payload: {
          status: 'None',
          record: null
        }
      });
    }
  }, [state.account, state.cvRegistryContract]);

  const approveCV = async (userAddress: string): Promise<string> => {
    if (!state.cvRegistryContract) {
      throw new Error('Contract not initialized');
    }

    if (!state.account) {
      throw new Error('Wallet not connected');
    }

    try {
      // Check if the current account is an approver
      const isApprover = await state.cvRegistryContract.isApprover(state.account);
      if (!isApprover) {
        throw new Error('Current wallet is not authorized as an approver');
      }

      console.log('Calling approveCV on contract for user:', userAddress);
      const tx = await state.cvRegistryContract.approveCV(userAddress);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      return tx.hash;
    } catch (error: any) {
      console.error('Error approving CV:', error);

      // Handle specific contract errors
      if (error.reason) {
        throw new Error(error.reason);
      } else if (error.message?.includes('unauthorized')) {
        throw new Error('Not authorized to approve CVs');
      } else if (error.message?.includes('user rejected')) {
        throw new Error('Transaction was rejected by user');
      } else {
        throw new Error(error.message || 'Failed to approve CV');
      }
    }
  };

  const rejectCV = async (userAddress: string, reason: string): Promise<string> => {
    if (!state.cvRegistryContract) {
      throw new Error('Contract not initialized');
    }

    if (!state.account) {
      throw new Error('Wallet not connected');
    }

    try {
      // Check if the current account is an approver
      const isApprover = await state.cvRegistryContract.isApprover(state.account);
      if (!isApprover) {
        throw new Error('Current wallet is not authorized as an approver');
      }

      console.log('Calling rejectCV on contract for user:', userAddress, 'with reason:', reason);
      const tx = await state.cvRegistryContract.rejectCV(userAddress, reason);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      return tx.hash;
    } catch (error: any) {
      console.error('Error rejecting CV:', error);

      // Handle specific contract errors
      if (error.reason) {
        throw new Error(error.reason);
      } else if (error.message?.includes('unauthorized')) {
        throw new Error('Not authorized to reject CVs');
      } else if (error.message?.includes('user rejected')) {
        throw new Error('Transaction was rejected by user');
      } else {
        throw new Error(error.message || 'Failed to reject CV');
      }
    }
  };

  const getPendingCVs = async (offset: number, limit: number): Promise<{users: string[], records: any[]}> => {
    if (!state.cvRegistryContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const result = await state.cvRegistryContract.getPendingCVs(offset, limit);
      const [users, records] = result;
      return { users, records };
    } catch (error: any) {
      console.error('Error fetching pending CVs:', error);
      throw new Error(error.reason || 'Failed to fetch pending CVs');
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: Web3ContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    submitCV,
    updateCV,
    getCVStatus,
    approveCV,
    rejectCV,
    getPendingCVs,
    clearError,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
}

// Custom hook to use Web3 context
export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}