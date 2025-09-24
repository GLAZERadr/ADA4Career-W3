'use client';

import { useState } from 'react';
import { IPFSUploadResult, CVMetadata } from '@/types/web3.types';
import IPFSService from '@/services/ipfs.service';

// Use the enhanced IPFS service with Pinata integration and mock fallback

export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const ipfsService = IPFSService.getInstance();

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
        const fileResult = await ipfsService.uploadFile(file, {
          pinataMetadata: {
            name: `CV_${cvData.personalInfo?.name || 'Unknown'}_${Date.now()}`,
            keyvalues: {
              type: 'cv_document',
              user: cvData.personalInfo?.email || 'unknown'
            }
          }
        });
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
      const metadataResult = await ipfsService.uploadJSON(metadata, {
        pinataMetadata: {
          name: `CV_Metadata_${metadata.name}_${Date.now()}`,
          keyvalues: {
            type: 'cv_metadata',
            user: metadata.email,
            version: metadata.version
          }
        }
      });

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