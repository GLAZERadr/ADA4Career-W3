'use client';

import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import useAuthStore from '@/store/useAuthStore';
import WalletConnectButton from '@/components/features/web3/WalletConnectButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Wallet, CheckCircle, AlertCircle } from 'lucide-react';

export default function WalletDemoPage() {
  const { isConnected, account, chainId } = useWeb3();
  const { user, isAuthenticated, logout, getAuthMethod, isWalletAuthenticated } = useAuthStore();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gradient-ms mb-4">
          Wallet Authentication Demo
        </h1>
        <p className="text-lg text-gray-600">
          Test Web3 wallet integration with ADA4Career authentication system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Web3 Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Web3 Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>

            {isConnected && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Address:</span>
                  <span className="text-sm font-mono">
                    {account ? formatAddress(account) : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Network:</span>
                  <Badge variant="outline">
                    {chainId === 4202 ? 'Lisk Sepolia' : `Chain ${chainId}`}
                  </Badge>
                </div>
              </>
            )}

            <div className="pt-2">
              <WalletConnectButton />
            </div>
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authenticated:</span>
              <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                {isAuthenticated ? 'Yes' : 'No'}
              </Badge>
            </div>

            {isAuthenticated && user && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Method:</span>
                  <Badge variant="outline">
                    {getAuthMethod() || 'Unknown'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{user.email}</span>
                </div>

                {user.walletAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Wallet:</span>
                    <span className="text-sm font-mono">
                      {formatAddress(user.walletAddress)}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <Button onClick={logout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Alerts */}
      <div className="mt-6 space-y-4">
        {isWalletAuthenticated() && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Wallet Authentication Active!</strong> You are authenticated using your Web3 wallet.
              Your wallet address is verified and linked to your account.
            </AlertDescription>
          </Alert>
        )}

        {isConnected && !isAuthenticated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Wallet connected but not authenticated. Use the &quot;Sign in with Wallet&quot; button above to authenticate.
            </AlertDescription>
          </Alert>
        )}

        {!isConnected && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No wallet connected. Please connect your MetaMask wallet to test authentication.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Integration Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How Wallet Authentication Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">1.</span>
            <p>User clicks &quot;Sign in with Wallet&quot; button</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">2.</span>
            <p>MetaMask prompts user to connect wallet (if not connected)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">3.</span>
            <p>User signs a message to prove wallet ownership (no gas fees)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">4.</span>
            <p>Backend verifies signature and creates/authenticates user account</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">5.</span>
            <p>User is logged in and can access Web3 features like CV blockchain verification</p>
          </div>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Development Mode:</strong> Since the backend API may not be available,
              this demo uses mock authentication that still requires wallet signature for security.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}