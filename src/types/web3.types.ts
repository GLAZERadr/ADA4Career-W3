export namespace CVRegistry {
  export interface CVRecord {
    ipfsHash: string;
    metadataHash: string;
    status: number;
    submissionTime: number;
    lastUpdateTime: number;
    submitter: string;
    rejectionReason: string;
  }

  export enum CVStatus {
    None = 0,
    Pending = 1,
    Approved = 2,
    Rejected = 3
  }

  export interface ContractEvents {
    CVSubmitted: {
      user: string;
      ipfsHash: string;
      metadataHash: string;
      timestamp: number;
    };
    CVUpdated: {
      user: string;
      oldIpfsHash: string;
      newIpfsHash: string;
      newMetadataHash: string;
      timestamp: number;
    };
    CVApproved: {
      user: string;
      approver: string;
      timestamp: number;
    };
    CVRejected: {
      user: string;
      rejector: string;
      reason: string;
      timestamp: number;
    };
  }
}

export interface WalletInfo {
  name: string;
  icon: string;
  connector: 'metamask' | 'walletconnect';
  installed: boolean;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  currency: string;
  rpcUrl: string;
  explorerUrl: string;
}

export interface IPFSUploadResult {
  hash: string;
  url: string;
  size: number;
}

export interface CVMetadata {
  name: string;
  email: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  timestamp: number;
  version: string;
}

export interface Web3Error {
  code: number;
  message: string;
  reason?: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
}