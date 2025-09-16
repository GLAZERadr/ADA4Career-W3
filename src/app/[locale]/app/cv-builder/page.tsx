'use client';

import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import Web3CVBuilder from '@/components/features/web3/Web3CVBuilder';
import WalletConnectButton from '@/components/features/web3/WalletConnectButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Rocket } from 'lucide-react';

export default function CVBuilderPage() {
  const { isConnected, chainId } = useWeb3();

  const isCorrectNetwork = chainId === 4202; // Lisk Sepolia

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gradient-ms mb-4">
          Web3 CV Builder Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create and submit your CV to the blockchain for permanent verification.
          Your credentials will be stored on IPFS and registered on Lisk Sepolia testnet.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <Rocket className="h-4 w-4" />
          <span>Connect your wallet to try Web3 features</span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {!isConnected && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your wallet to start building your Web3 CV
              </AlertDescription>
            </Alert>
          )}

          {isConnected && !isCorrectNetwork && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please switch to Lisk Sepolia testnet to use this feature
              </AlertDescription>
            </Alert>
          )}

          {isConnected && isCorrectNetwork && (
            <Alert className="border-green-200 bg-green-50">
              <Rocket className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Ready to build your Web3 CV on Lisk Sepolia testnet
              </AlertDescription>
            </Alert>
          )}
        </div>

        <WalletConnectButton />
      </div>

      {/* Features Overview */}
      {!isConnected && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Web3 CV Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="font-semibold mb-2">Blockchain Verified</h3>
                <p className="text-sm text-gray-600">
                  Your CV is permanently recorded on Ethereum blockchain
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-semibold mb-2">Admin Approval</h3>
                <p className="text-sm text-gray-600">
                  Credentials are verified by authorized approvers
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📁</span>
                </div>
                <h3 className="font-semibold mb-2">IPFS Storage</h3>
                <p className="text-sm text-gray-600">
                  Decentralized storage ensures data availability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CV Builder Component */}
      <Web3CVBuilder />

      {/* Development Notice */}
      <Card className="mt-8 border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-orange-800">Development Mode</p>
              <p className="text-orange-700">
                This is running on Lisk Sepolia testnet. Use test ETH for transactions.
                IPFS storage is currently mocked for development.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}