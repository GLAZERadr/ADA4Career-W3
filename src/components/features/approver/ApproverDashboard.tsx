'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  ExternalLink,
  RefreshCw,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useWeb3 } from '@/contexts/Web3Context';

interface CVRecord {
  ipfsHash: string;
  metadataHash: string;
  status: number; // 0=None, 1=Pending, 2=Approved, 3=Rejected
  submissionTime: bigint;
  lastUpdateTime: bigint;
  submitter: string;
  rejectionReason: string;
}

interface PendingCV {
  userAddress: string;
  record: CVRecord;
  ipfsData?: any;
}

export default function ApproverDashboard() {
  const [pendingCVs, setPendingCVs] = useState<PendingCV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set());
  const [rejectionReasons, setRejectionReasons] = useState<{[key: string]: string}>({});
  const [showRejectForm, setShowRejectForm] = useState<{[key: string]: boolean}>({});

  const {
    isConnected,
    cvRegistryContract,
    approveCV: contextApproveCV,
    rejectCV: contextRejectCV,
    getPendingCVs: contextGetPendingCVs
  } = useWeb3();

  // Fetch pending CVs from smart contract
  const fetchPendingCVs = async () => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (!cvRegistryContract) {
        throw new Error('Smart contract not initialized. Please wait a moment and try again.');
      }

      console.log('Fetching pending CVs...', {
        isConnected,
        hasContract: !!cvRegistryContract,
        contractAddress: cvRegistryContract?.address
      });

      // Call getPendingCVs with offset=0, limit=20
      const result = await contextGetPendingCVs(0, 20);
      const { users: userAddresses, records: cvRecords } = result;

      console.log('Fetched pending CVs:', { userAddresses, cvRecords });

      // Combine user addresses with their CV records
      const pendingList: PendingCV[] = userAddresses.map((address: string, index: number) => ({
        userAddress: address,
        record: cvRecords[index]
      }));

      // Fetch IPFS data for each CV
      const pendingWithIpfs = await Promise.all(
        pendingList.map(async (cv) => {
          try {
            // Fetch IPFS data
            const ipfsUrl = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${cv.record.ipfsHash}`;
            const response = await fetch(ipfsUrl);
            const ipfsData = await response.json();

            return {
              ...cv,
              ipfsData
            };
          } catch (error) {
            console.error(`Failed to fetch IPFS data for ${cv.userAddress}:`, error);
            return cv;
          }
        })
      );

      setPendingCVs(pendingWithIpfs);
    } catch (error: any) {
      console.error('Error fetching pending CVs:', error);
      toast.error(`Failed to fetch pending CVs: ${error.message}`, {});
    } finally {
      setIsLoading(false);
    }
  };

  // Approve CV
  const approveCV = async (userAddress: string) => {
    try {
      setProcessingActions(prev => new Set(prev).add(userAddress));

      console.log('Approving CV for user:', userAddress);
      console.log('Contract available:', !!cvRegistryContract);
      console.log('Is connected:', isConnected);

      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (!cvRegistryContract) {
        throw new Error('Smart contract not initialized');
      }

      toast.loading('Approving CV on blockchain...', { toastId: 'approve' });

      const txHash = await contextApproveCV(userAddress);

      toast.dismiss('approve');
      toast.success(`CV approved successfully! Transaction: ${txHash.slice(0, 10)}...`, {});

      // Refresh the list
      await fetchPendingCVs();

    } catch (error: any) {
      console.error('Error approving CV:', error);
      console.error('Error details:', {
        message: error.message,
        reason: error.reason,
        code: error.code,
        data: error.data
      });

      toast.dismiss('approve');

      let errorMessage = 'Failed to approve CV';
      if (error.message?.includes('user rejected') || error.message?.includes('User denied')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fee';
      } else if (error.message?.includes('Contract not initialized')) {
        errorMessage = 'Smart contract not available. Please refresh and try again.';
      } else if (error.message?.includes('Wallet not connected')) {
        errorMessage = 'Please connect your wallet first';
      } else {
        errorMessage = `Failed to approve CV: ${error.message}`;
      }

      toast.error(errorMessage, {});
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(userAddress);
        return newSet;
      });
    }
  };

  // Reject CV
  const rejectCV = async (userAddress: string) => {
    try {
      const reason = rejectionReasons[userAddress];
      if (!reason?.trim()) {
        toast.error('Please provide a rejection reason', {});
        return;
      }

      setProcessingActions(prev => new Set(prev).add(userAddress));

      console.log('Rejecting CV for user:', userAddress, 'Reason:', reason);
      console.log('Contract available:', !!cvRegistryContract);
      console.log('Is connected:', isConnected);

      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (!cvRegistryContract) {
        throw new Error('Smart contract not initialized');
      }

      toast.loading('Rejecting CV on blockchain...', { toastId: 'reject' });

      const txHash = await contextRejectCV(userAddress, reason.trim());

      toast.dismiss('reject');
      toast.success(`CV rejected successfully! Transaction: ${txHash.slice(0, 10)}...`, {});

      // Clear the form
      setRejectionReasons(prev => ({ ...prev, [userAddress]: '' }));
      setShowRejectForm(prev => ({ ...prev, [userAddress]: false }));

      // Refresh the list
      await fetchPendingCVs();

    } catch (error: any) {
      console.error('Error rejecting CV:', error);
      console.error('Error details:', {
        message: error.message,
        reason: error.reason,
        code: error.code,
        data: error.data
      });

      toast.dismiss('reject');

      let errorMessage = 'Failed to reject CV';
      if (error.message?.includes('user rejected') || error.message?.includes('User denied')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fee';
      } else if (error.message?.includes('Contract not initialized')) {
        errorMessage = 'Smart contract not available. Please refresh and try again.';
      } else if (error.message?.includes('Wallet not connected')) {
        errorMessage = 'Please connect your wallet first';
      } else {
        errorMessage = `Failed to reject CV: ${error.message}`;
      }

      toast.error(errorMessage, {});
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(userAddress);
        return newSet;
      });
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  // Load pending CVs on component mount
  useEffect(() => {
    if (isConnected && cvRegistryContract) {
      fetchPendingCVs();
    }
  }, [isConnected, cvRegistryContract]);

  if (isLoading) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Loading Pending CVs...</h3>
          <p className="text-gray-600">Fetching CV submissions from the blockchain</p>
        </CardContent>
      </Card>
    );
  }

  if (isConnected && !cvRegistryContract) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <h3 className="text-lg font-semibold mb-2">Initializing Smart Contract...</h3>
          <p className="text-gray-600">Please wait while we connect to the CV Registry contract</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pending CV Reviews</h2>
          <p className="text-gray-600">
            {pendingCVs.length} CV{pendingCVs.length !== 1 ? 's' : ''} waiting for approval
          </p>
        </div>
        <Button
          onClick={fetchPendingCVs}
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* No Pending CVs */}
      {pendingCVs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-gray-600">
              No pending CV submissions to review at this time.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending CVs List */}
      {pendingCVs.map((cv) => (
        <Card key={cv.userAddress} className="border-l-4 border-l-yellow-400">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  CV Submission
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </CardTitle>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Applicant:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all">
                      {cv.userAddress}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {formatTimestamp(cv.record.submissionTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* CV Data Preview */}
            {cv.ipfsData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CV Preview
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p>{cv.ipfsData.personalInfo?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p>{cv.ipfsData.personalInfo?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <p>{cv.ipfsData.personalInfo?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <p>{cv.ipfsData.personalInfo?.location || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Summary:</span>
                    <p className="mt-1">{cv.ipfsData.personalInfo?.summary || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cv.ipfsData.skills?.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      )) || 'No skills listed'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* IPFS Links */}
            <div className="flex gap-2 text-sm">
              <a
                href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${cv.record.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View CV Data
              </a>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">
                IPFS: {cv.record.ipfsHash.slice(0, 20)}...
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {/* Approve Button */}
              <Button
                onClick={() => approveCV(cv.userAddress)}
                disabled={processingActions.has(cv.userAddress)}
                className="bg-green-600 hover:bg-green-700"
              >
                {processingActions.has(cv.userAddress) ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve CV
              </Button>

              {/* Reject Button */}
              <Button
                onClick={() => setShowRejectForm(prev => ({
                  ...prev,
                  [cv.userAddress]: !prev[cv.userAddress]
                }))}
                disabled={processingActions.has(cv.userAddress)}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject CV
              </Button>
            </div>

            {/* Rejection Form */}
            {showRejectForm[cv.userAddress] && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-3">
                  <div>
                    <Label htmlFor={`reason-${cv.userAddress}`} className="text-red-800 font-medium">
                      Rejection Reason (Required)
                    </Label>
                    <Textarea
                      id={`reason-${cv.userAddress}`}
                      value={rejectionReasons[cv.userAddress] || ''}
                      onChange={(e) => setRejectionReasons(prev => ({
                        ...prev,
                        [cv.userAddress]: e.target.value
                      }))}
                      placeholder="Please provide a clear reason for rejection..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => rejectCV(cv.userAddress)}
                      disabled={processingActions.has(cv.userAddress) || !rejectionReasons[cv.userAddress]?.trim()}
                      variant="destructive"
                      size="sm"
                    >
                      {processingActions.has(cv.userAddress) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Confirm Rejection
                    </Button>
                    <Button
                      onClick={() => setShowRejectForm(prev => ({
                        ...prev,
                        [cv.userAddress]: false
                      }))}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}