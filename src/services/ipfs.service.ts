'use client';

import { IPFSUploadResult, CVMetadata } from '@/types/web3.types';

interface PinataConfig {
  apiKey: string;
  apiSecret: string;
  pinataJWT?: string;
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

class IPFSService {
  private static instance: IPFSService;
  private config: PinataConfig | null = null;
  private fallbackToMock = true;

  static getInstance(): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService();
    }
    return IPFSService.instance;
  }

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig() {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;

    if (apiKey && (apiSecret || jwt)) {
      this.config = {
        apiKey,
        apiSecret: apiSecret || '',
        pinataJWT: jwt
      };
      this.fallbackToMock = false;
      console.log('✅ IPFS Service initialized with Pinata');
    } else {
      console.warn('⚠️ Pinata credentials not found, using mock IPFS service');
      this.fallbackToMock = true;
    }
  }

  async uploadJSON(data: any, options?: {
    pinataMetadata?: {
      name: string;
      keyvalues?: Record<string, string>;
    };
  }): Promise<IPFSUploadResult> {
    if (this.fallbackToMock || !this.config) {
      return this.mockUploadJSON(data);
    }

    try {
      const body = new FormData();
      const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      body.append('file', jsonBlob);

      if (options?.pinataMetadata) {
        body.append('pinataMetadata', JSON.stringify(options.pinataMetadata));
      }

      // Pin options for better organization
      const pinataOptions = {
        cidVersion: 1,
        customPinPolicy: {
          regions: [
            { id: 'FRA1', desiredReplicationCount: 2 },
            { id: 'NYC1', desiredReplicationCount: 2 }
          ]
        }
      };
      body.append('pinataOptions', JSON.stringify(pinataOptions));

      const headers: HeadersInit = {};

      if (this.config.pinataJWT) {
        headers.Authorization = `Bearer ${this.config.pinataJWT}`;
      } else {
        headers.pinata_api_key = this.config.apiKey;
        headers.pinata_secret_api_key = this.config.apiSecret;
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Pinata API error: ${response.status} ${errorData.error || response.statusText}`);
      }

      const result: PinataResponse = await response.json();

      return {
        hash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        size: result.PinSize
      };

    } catch (error: any) {
      console.error('IPFS upload failed, falling back to mock:', error);
      // Fallback to mock on error
      return this.mockUploadJSON(data);
    }
  }

  async uploadFile(file: File, options?: {
    pinataMetadata?: {
      name: string;
      keyvalues?: Record<string, string>;
    };
  }): Promise<IPFSUploadResult> {
    if (this.fallbackToMock || !this.config) {
      return this.mockUploadFile(file);
    }

    try {
      const body = new FormData();
      body.append('file', file);

      if (options?.pinataMetadata) {
        body.append('pinataMetadata', JSON.stringify(options.pinataMetadata));
      }

      const pinataOptions = {
        cidVersion: 1,
        customPinPolicy: {
          regions: [
            { id: 'FRA1', desiredReplicationCount: 2 },
            { id: 'NYC1', desiredReplicationCount: 2 }
          ]
        }
      };
      body.append('pinataOptions', JSON.stringify(pinataOptions));

      const headers: HeadersInit = {};

      if (this.config.pinataJWT) {
        headers.Authorization = `Bearer ${this.config.pinataJWT}`;
      } else {
        headers.pinata_api_key = this.config.apiKey;
        headers.pinata_secret_api_key = this.config.apiSecret;
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Pinata API error: ${response.status} ${errorData.error || response.statusText}`);
      }

      const result: PinataResponse = await response.json();

      return {
        hash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        size: result.PinSize
      };

    } catch (error: any) {
      console.error('IPFS file upload failed, falling back to mock:', error);
      return this.mockUploadFile(file);
    }
  }

  async retrieve(hash: string): Promise<any> {
    if (this.fallbackToMock || !this.config) {
      return this.mockRetrieve(hash);
    }

    try {
      // Try multiple gateways for better reliability
      const gateways = [
        `https://gateway.pinata.cloud/ipfs/${hash}`,
        `https://ipfs.io/ipfs/${hash}`,
        `https://cloudflare-ipfs.com/ipfs/${hash}`
      ];

      for (const gateway of gateways) {
        try {
          const response = await fetch(gateway, {
            timeout: 10000 // 10 second timeout
          } as RequestInit);

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              return await response.json();
            } else {
              return await response.blob();
            }
          }
        } catch (gatewayError) {
          console.warn(`Gateway ${gateway} failed:`, gatewayError);
          continue;
        }
      }

      throw new Error(`Failed to retrieve content from all gateways for hash: ${hash}`);

    } catch (error: any) {
      console.error('IPFS retrieve failed, falling back to mock:', error);
      return this.mockRetrieve(hash);
    }
  }

  async testConnection(): Promise<boolean> {
    if (this.fallbackToMock || !this.config) {
      return false;
    }

    try {
      const headers: HeadersInit = {};

      if (this.config.pinataJWT) {
        headers.Authorization = `Bearer ${this.config.pinataJWT}`;
      } else {
        headers.pinata_api_key = this.config.apiKey;
        headers.pinata_secret_api_key = this.config.apiSecret;
      }

      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        headers
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // Mock implementations for fallback
  private mockStorage: Map<string, any> = new Map();

  private async mockUploadJSON(data: any): Promise<IPFSUploadResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const hash = this.generateMockHash(JSON.stringify(data));
    const size = new Blob([JSON.stringify(data)]).size;
    this.mockStorage.set(hash, data);
    return {
      hash,
      url: `https://ipfs.io/ipfs/${hash}`,
      size
    };
  }

  private async mockUploadFile(file: File): Promise<IPFSUploadResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const buffer = await file.arrayBuffer();
    const hash = this.generateMockHash(buffer.toString());
    const size = file.size;
    this.mockStorage.set(hash, file);
    return {
      hash,
      url: `https://ipfs.io/ipfs/${hash}`,
      size
    };
  }

  private async mockRetrieve(hash: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!this.mockStorage.has(hash)) {
      throw new Error(`Content not found for hash: ${hash}`);
    }
    return this.mockStorage.get(hash);
  }

  private generateMockHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `Qm${Math.abs(hash).toString(36)}${'a'.repeat(40 - Math.abs(hash).toString(36).length)}`;
  }

  // Utility methods
  isUsingRealIPFS(): boolean {
    return !this.fallbackToMock && this.config !== null;
  }

  getServiceInfo(): { provider: string; isReal: boolean; config: boolean } {
    return {
      provider: this.fallbackToMock ? 'Mock' : 'Pinata',
      isReal: !this.fallbackToMock,
      config: this.config !== null
    };
  }
}

export default IPFSService;