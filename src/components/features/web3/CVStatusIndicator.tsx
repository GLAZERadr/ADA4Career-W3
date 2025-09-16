'use client';

import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import { AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CVStatusIndicator() {
  const { isConnected, cvStatus, cvRecord, getCVStatus } = useWeb3();

  useEffect(() => {
    if (isConnected) {
      getCVStatus();
    }
  }, [isConnected, getCVStatus]);

  const handleRefresh = async () => {
    await getCVStatus();
  };

  const simulateApproval = () => {
    // Simulate approval by directly updating the context state
    const approvedRecord = cvRecord ? {
      ...cvRecord,
      status: 2, // Approved
      lastUpdateTime: Math.floor(Date.now() / 1000)
    } : null;

    // Dispatch approval to Web3Context (we'll need to expose this)
    window.dispatchEvent(new CustomEvent('demo-cv-approve', {
      detail: { record: approvedRecord }
    }));
  };

  const simulateRejection = () => {
    // Simulate rejection by directly updating the context state
    const rejectedRecord = cvRecord ? {
      ...cvRecord,
      status: 3, // Rejected
      rejectionReason: 'Demo rejection: CV format needs improvement',
      lastUpdateTime: Math.floor(Date.now() / 1000)
    } : null;

    // Dispatch rejection to Web3Context
    window.dispatchEvent(new CustomEvent('demo-cv-reject', {
      detail: { record: rejectedRecord }
    }));
  };

  if (!isConnected) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to view CV blockchain status
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusConfig = () => {
    switch (cvStatus) {
      case 'None':
        return {
          badge: <Badge variant="secondary">Not Submitted</Badge>,
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          color: 'gray',
          description: 'Your CV has not been submitted to the blockchain yet.'
        };
      case 'Pending':
        return {
          badge: <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending Approval</Badge>,
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          color: 'yellow',
          description: 'Your CV is awaiting approval from an administrator.'
        };
      case 'Approved':
        return {
          badge: <Badge variant="default" className="bg-green-500">Approved</Badge>,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          color: 'green',
          description: 'Your CV has been approved and is verified on the blockchain.'
        };
      case 'Rejected':
        return {
          badge: <Badge variant="destructive">Rejected</Badge>,
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          color: 'red',
          description: cvRecord?.rejectionReason || 'Your CV was rejected. Please review and resubmit.'
        };
      default:
        return {
          badge: <Badge variant="secondary">Loading...</Badge>,
          icon: <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />,
          color: 'gray',
          description: 'Loading CV status...'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Blockchain CV Status</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {statusConfig.icon}
          <div className="flex-1">
            {statusConfig.badge}
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {statusConfig.description}
        </p>

        {cvRecord && cvRecord.submissionTime > 0 && (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-700">Submitted:</span>
                <br />
                <span className="text-gray-600">
                  {formatDate(cvRecord.submissionTime)}
                </span>
              </div>
              {cvRecord.lastUpdateTime !== cvRecord.submissionTime && (
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <br />
                  <span className="text-gray-600">
                    {formatDate(cvRecord.lastUpdateTime)}
                  </span>
                </div>
              )}
            </div>

            {cvRecord.ipfsHash && (
              <div>
                <span className="font-medium text-gray-700">IPFS Hash:</span>
                <br />
                <span className="text-xs font-mono text-gray-600 break-all">
                  {cvRecord.ipfsHash}
                </span>
              </div>
            )}

            {cvStatus === 'Rejected' && cvRecord.rejectionReason && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rejection Reason:</strong> {cvRecord.rejectionReason}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {cvStatus === 'Approved' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Blockchain Verified</p>
              <p className="text-green-700">
                Your CV is permanently recorded and verified on the Ethereum blockchain.
              </p>
            </div>
          </div>
        )}

        {(cvStatus === 'None' || cvStatus === 'Rejected') && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Ready to Submit</p>
              <p className="text-blue-700">
                Save your CV to submit it to the blockchain for verification.
              </p>
            </div>
          </div>
        )}

        {cvStatus === 'Pending' && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <div className="text-sm flex-1">
              <p className="font-medium text-gray-800">Demo Admin Panel</p>
              <p className="text-gray-600 text-xs mb-2">
                For demonstration purposes, you can simulate admin approval/rejection:
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => simulateApproval()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Simulate Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => simulateRejection()}
                >
                  Simulate Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CVStatusIndicator;