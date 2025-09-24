import { NetworkConfig } from '@/types/web3.types';

export interface ExtendedNetworkConfig extends NetworkConfig {
  isMainnet: boolean;
  contractAddresses: {
    cvRegistry?: string;
  };
  blockExplorerUrls: string[];
  iconUrl?: string;
  faucetUrl?: string;
  bridgeUrl?: string;
}

export const SUPPORTED_NETWORKS: Record<number, ExtendedNetworkConfig> = {
  // Lisk Sepolia Testnet (Primary)
  4202: {
    chainId: 4202,
    name: 'Lisk Sepolia Testnet',
    currency: 'ETH',
    rpcUrl: 'https://rpc.sepolia-api.lisk.com',
    explorerUrl: 'https://sepolia-blockscout.lisk.com',
    isMainnet: false,
    contractAddresses: {
      cvRegistry: process.env.NEXT_PUBLIC_LISK_SEPOLIA_CV_REGISTRY_ADDRESS || ''
    },
    blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
    iconUrl: '/images/networks/lisk.svg',
    faucetUrl: 'https://sepolia-faucet.lisk.com',
    bridgeUrl: 'https://bridge.lisk.com'
  },

  // Lisk Mainnet
  1135: {
    chainId: 1135,
    name: 'Lisk Mainnet',
    currency: 'ETH',
    rpcUrl: 'https://rpc.api.lisk.com',
    explorerUrl: 'https://blockscout.lisk.com',
    isMainnet: true,
    contractAddresses: {
      cvRegistry: process.env.NEXT_PUBLIC_LISK_MAINNET_CV_REGISTRY_ADDRESS || ''
    },
    blockExplorerUrls: ['https://blockscout.lisk.com'],
    iconUrl: '/images/networks/lisk.svg',
    bridgeUrl: 'https://bridge.lisk.com'
  },

  // Ethereum Sepolia (for testing)
  11155111: {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    currency: 'ETH',
    rpcUrl: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || ''}`,
    explorerUrl: 'https://sepolia.etherscan.io',
    isMainnet: false,
    contractAddresses: {
      cvRegistry: process.env.NEXT_PUBLIC_ETH_SEPOLIA_CV_REGISTRY_ADDRESS || ''
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    iconUrl: '/images/networks/ethereum.svg',
    faucetUrl: 'https://sepoliafaucet.com'
  },

  // Ethereum Mainnet
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || ''}`,
    explorerUrl: 'https://etherscan.io',
    isMainnet: true,
    contractAddresses: {
      cvRegistry: process.env.NEXT_PUBLIC_ETH_MAINNET_CV_REGISTRY_ADDRESS || ''
    },
    blockExplorerUrls: ['https://etherscan.io'],
    iconUrl: '/images/networks/ethereum.svg'
  },

  // Polygon Mumbai (for testing)
  80001: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    currency: 'MATIC',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://mumbai.polygonscan.com',
    isMainnet: false,
    contractAddresses: {
      cvRegistry: process.env.NEXT_PUBLIC_POLYGON_MUMBAI_CV_REGISTRY_ADDRESS || ''
    },
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
    iconUrl: '/images/networks/polygon.svg',
    faucetUrl: 'https://faucet.polygon.technology'
  },

  // Polygon Mainnet
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    currency: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    isMainnet: true,
    contractAddresses: {
      cvRegistry: process.env.NEXT_PUBLIC_POLYGON_MAINNET_CV_REGISTRY_ADDRESS || ''
    },
    blockExplorerUrls: ['https://polygonscan.com'],
    iconUrl: '/images/networks/polygon.svg'
  }
};

// Default network (Lisk Sepolia)
export const DEFAULT_NETWORK_ID = 4202;

// Get network config by chain ID
export function getNetworkConfig(chainId: number): ExtendedNetworkConfig | null {
  return SUPPORTED_NETWORKS[chainId] || null;
}

// Get all supported network IDs
export function getSupportedNetworkIds(): number[] {
  return Object.keys(SUPPORTED_NETWORKS).map(Number);
}

// Get testnet networks
export function getTestnetNetworks(): ExtendedNetworkConfig[] {
  return Object.values(SUPPORTED_NETWORKS).filter(network => !network.isMainnet);
}

// Get mainnet networks
export function getMainnetNetworks(): ExtendedNetworkConfig[] {
  return Object.values(SUPPORTED_NETWORKS).filter(network => network.isMainnet);
}

// Check if network is supported
export function isNetworkSupported(chainId: number): boolean {
  return chainId in SUPPORTED_NETWORKS;
}

// Get contract address for current network
export function getContractAddress(chainId: number, contractName: keyof ExtendedNetworkConfig['contractAddresses']): string {
  const network = getNetworkConfig(chainId);
  return network?.contractAddresses[contractName] || '';
}

// Format chain ID for wallet requests
export function formatChainId(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

// Network switching helper
export function buildAddNetworkParams(chainId: number) {
  const network = getNetworkConfig(chainId);
  if (!network) {
    throw new Error(`Unsupported network: ${chainId}`);
  }

  return {
    chainId: formatChainId(chainId),
    chainName: network.name,
    rpcUrls: [network.rpcUrl],
    nativeCurrency: {
      name: network.currency,
      symbol: network.currency,
      decimals: 18,
    },
    blockExplorerUrls: network.blockExplorerUrls,
    iconUrls: network.iconUrl ? [network.iconUrl] : undefined
  };
}