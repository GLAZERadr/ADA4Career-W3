'use client';

import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import ApproverDashboard from '@/components/features/approver/ApproverDashboard';
import WalletConnectButton from '@/components/features/web3/WalletConnectButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Shield, CheckCircle } from 'lucide-react';

export default function ApproverDashboardPage() {
  const { isConnected, chainId, account } = useWeb3();

  const isCorrectNetwork = chainId === 4202; // Lisk Sepolia
  const approverAddresses = [
    '0xa7e7401039e0D686cdC39d2d1752ac3C432A2375',  // Original approver
    '0x576A8455De3aC20E62b33dC05d77CBe3F3abE2e5'   // Your wallet
  ];
  const isApprover = account ? approverAddresses.some(addr =>
    account.toLowerCase() === addr.toLowerCase()
  ) : false;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm mb-4" role="status" aria-live="polite">
          <Shield className="h-4 w-4" aria-hidden="true" />
          <span>CV Approver Dashboard</span>
        </div>
        <h1 className="text-4xl font-bold text-gradient-ms mb-4">
          ADA4Career CV Review Center
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Review and approve CV submissions from job seekers. All actions are recorded on the blockchain for transparency.
        </p>
      </header>

      {/* Access Control Checks */}
      <section aria-labelledby="access-status" className="mb-6">
        <h2 id="access-status" className="sr-only">Access Status</h2>

        {/* Wallet Connection Status */}
        {!isConnected && (
          <Alert className="mb-4" role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              Connect your approver wallet to access the dashboard
            </AlertDescription>
          </Alert>
        )}

        {/* Network Check */}
        {isConnected && !isCorrectNetwork && (
          <Alert variant="destructive" className="mb-4" role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              Please switch to Lisk Sepolia testnet (Chain ID: 4202) to access the dashboard
            </AlertDescription>
          </Alert>
        )}

        {/* Approver Permission Check */}
        {isConnected && isCorrectNetwork && !isApprover && (
          <Alert variant="destructive" className="mb-4" role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              Access denied. Only authorized approvers can access this dashboard. Your wallet: {account}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {isConnected && isCorrectNetwork && isApprover && (
          <Alert className="border-green-200 bg-green-50 mb-4" role="status">
            <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
            <AlertDescription className="text-green-700">
              Welcome, authorized approver! You can now review and approve CV submissions.
            </AlertDescription>
          </Alert>
        )}

        {/* Wallet Connection Component */}
        {!isConnected && (
          <div className="flex justify-center mb-6">
            <WalletConnectButton />
          </div>
        )}
      </section>

      {/* Approver Info Card */}
      {isConnected && (
        <section className="mb-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                <Shield className="h-5 w-5" aria-hidden="true" />
                Approver Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Connected Wallet:</span>
                  <div className="font-mono text-xs bg-white p-2 rounded mt-1 break-all">
                    {account}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Network:</span>
                  <span className={`ml-2 ${isCorrectNetwork ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrectNetwork ? 'Lisk Sepolia ✓' : 'Wrong Network ✗'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Access Level:</span>
                  <span className={`ml-2 ${isApprover ? 'text-green-600' : 'text-red-600'}`}>
                    {isApprover ? 'Authorized Approver ✓' : 'Unauthorized ✗'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Main Dashboard Content */}
      <main id="main-content">
        {isConnected && isCorrectNetwork && isApprover ? (
          <ApproverDashboard />
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Dashboard Access Required</h3>
              <p className="text-gray-600">
                Connect your authorized approver wallet to access the CV review dashboard.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}