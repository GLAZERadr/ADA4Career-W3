'use client';

import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import Web3CVBuilder from '@/components/features/web3/Web3CVBuilder';
import WalletConnectButton from '@/components/features/web3/WalletConnectButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Rocket, Shield, Globe } from 'lucide-react';

export default function Web3DemoPage() {
  const { isConnected, chainId, account } = useWeb3();

  const isCorrectNetwork = chainId === 4202; // Lisk Sepolia

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      {/* Demo Header */}
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm mb-4" role="status" aria-live="polite">
          <Shield className="h-4 w-4" aria-hidden="true" />
          <span>{isConnected ? 'Wallet Connected Successfully!' : 'Connect Your Wallet to Continue'}</span>
        </div>
        <h1 className="text-4xl font-bold text-gradient-ms mb-4">
          ADA4Career Verified CV Builder
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Welcome to the Web3-enabled CV builder! This demo showcases blockchain integration,
          smart contract interaction, and decentralized storage capabilities.
        </p>
      </header>

      {/* Demo Features Overview */}
      <section aria-labelledby="features-heading" className="mb-8">
        <h2 id="features-heading" className="sr-only">Web3 Features Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Wallet Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Secure login using MetaMask wallet signature - no passwords needed!
              </p>
              {account && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono break-all" role="status" aria-label={`Connected wallet address: ${account}`}>
                  {account}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Smart Contract Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                CV data stored on Lisk Sepolia testnet with approval workflow
              </p>
              <div className="mt-2 text-xs text-green-600" role="status" aria-live="polite">
                Network: {isCorrectNetwork ? 'Lisk Sepolia ✓' : 'Wrong Network ⚠️'}
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <Rocket className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">IPFS Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Decentralized file storage for CV documents and metadata
              </p>
              <div className="mt-2 text-xs text-purple-600">
                Real IPFS integration with Pinata
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Connection Status */}
      <section aria-labelledby="connection-status" className="mb-6">
        <h2 id="connection-status" className="sr-only">Wallet Connection Status</h2>

        {!isConnected && (
          <Alert className="mb-4" role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              Connect your wallet to interact with Web3 features
            </AlertDescription>
          </Alert>
        )}

        {isConnected && !isCorrectNetwork && (
          <Alert variant="destructive" className="mb-4" role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              Please switch to Lisk Sepolia testnet (Chain ID: 4202) to use this demo
            </AlertDescription>
          </Alert>
        )}

        {isConnected && isCorrectNetwork && (
          <Alert className="border-green-200 bg-green-50 mb-4" role="status">
            <Rocket className="h-4 w-4 text-green-600" aria-hidden="true" />
            <AlertDescription className="text-green-700">
              Ready to build your Web3 CV! All systems connected.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          <WalletConnectButton />
        </div>
      </section>

      {/* CV Builder Component */}
      <main id="main-content">
        <Web3CVBuilder />
      </main>

      {/* Demo Instructions */}
      <section aria-labelledby="instructions-heading" className="mt-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 id="instructions-heading" className="font-semibold text-blue-800 mb-2">Demo Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <p><strong>1. Connect Wallet:</strong> Use the button above to connect MetaMask</p>
                  <p><strong>2. Switch Network:</strong> Ensure you're on Lisk Sepolia testnet</p>
                </div>
                <div>
                  <p><strong>3. Fill CV Form:</strong> Add your professional information</p>
                  <p><strong>4. Submit to Blockchain:</strong> Store your CV on-chain (real transactions with gas fees)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}