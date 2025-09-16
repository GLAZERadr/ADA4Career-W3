'use client';

import { useState } from 'react';
import { IPFSUploadResult, CVMetadata } from '@/types/web3.types';

// Mock IPFS service - replace with actual IPFS integration
class MockIPFSService {
  private static instance: MockIPFSService;
  private storage: Map<string, any> = new Map();

  static getInstance(): MockIPFSService {
    if (!MockIPFSService.instance) {
      MockIPFSService.instance = new MockIPFSService();
    }
    return MockIPFSService.instance;
  }

  async uploadJSON(data: any): Promise<IPFSUploadResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const hash = this.generateHash(JSON.stringify(data));
    const size = new Blob([JSON.stringify(data)]).size;

    this.storage.set(hash, data);

    return {
      hash,
      url: `https://ipfs.io/ipfs/${hash}`,
      size
    };
  }

  async uploadFile(file: File): Promise<IPFSUploadResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const buffer = await file.arrayBuffer();
    const hash = this.generateHash(buffer.toString());
    const size = file.size;

    this.storage.set(hash, file);

    return {
      hash,
      url: `https://ipfs.io/ipfs/${hash}`,
      size
    };
  }

  async retrieve(hash: string): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!this.storage.has(hash)) {
      throw new Error(`Content not found for hash: ${hash}`);
    }

    return this.storage.get(hash);
  }

  private generateHash(content: string): string {
    // Simple hash function for demo - use proper IPFS hash in production
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `Qm${Math.abs(hash).toString(36)}${'a'.repeat(40 - Math.abs(hash).toString(36).length)}`;
  }
}

export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const ipfsService = MockIPFSService.getInstance();

  const uploadCV = async (cvData: any, file?: File): Promise<{
    cvHash: string;
    metadataHash: string;
  }> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      let fileHash = '';

      // Upload file if provided
      if (file) {
        setUploadProgress(25);
        const fileResult = await ipfsService.uploadFile(file);
        fileHash = fileResult.hash;
        setUploadProgress(50);
      }

      // Create metadata
      const metadata: CVMetadata = {
        name: cvData.personalInfo?.name || '',
        email: cvData.personalInfo?.email || '',
        skills: cvData.skills || [],
        experience: cvData.experience || [],
        education: cvData.education || [],
        timestamp: Date.now(),
        version: '1.0'
      };

      // Add file reference if uploaded
      if (fileHash) {
        (metadata as any).fileHash = fileHash;
      }

      setUploadProgress(75);

      // Upload metadata
      const metadataResult = await ipfsService.uploadJSON(metadata);

      setUploadProgress(100);

      return {
        cvHash: fileHash || metadataResult.hash, // Use file hash if available, otherwise metadata hash
        metadataHash: metadataResult.hash
      };

    } catch (err: any) {
      setError(err.message || 'Failed to upload to IPFS');
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const retrieveCV = async (hash: string): Promise<CVMetadata> => {
    setError(null);

    try {
      const data = await ipfsService.retrieve(hash);
      return data as CVMetadata;
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve from IPFS');
      throw err;
    }
  };

  const generateMetadataHash = (cvData: any): string => {
    const metadata: CVMetadata = {
      name: cvData.personalInfo?.name || '',
      email: cvData.personalInfo?.email || '',
      skills: cvData.skills || [],
      experience: cvData.experience || [],
      education: cvData.education || [],
      timestamp: Date.now(),
      version: '1.0'
    };

    // Simple hash for metadata - in production, use proper hashing
    return btoa(JSON.stringify(metadata)).slice(0, 32);
  };

  return {
    uploadCV,
    retrieveCV,
    generateMetadataHash,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null)
  };
}