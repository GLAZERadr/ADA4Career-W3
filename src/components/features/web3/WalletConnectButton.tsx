'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWeb3 } from '@/contexts/Web3Context';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WalletOption {
  name: string;
  icon: string;
  connector: 'metamask' | 'walletconnect';
  installed: boolean;
}

export function WalletConnectButton() {
  const {
    isConnected,
    account,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    clearError
  } = useWeb3();

  const walletOptions: WalletOption[] = [
    {
      name: 'MetaMask',
      icon: '🦊',
      connector: 'metamask',
      installed: typeof window !== 'undefined' && !!window.ethereum
    },
    {
      name: 'WalletConnect',
      icon: '🌐',
      connector: 'walletconnect',
      installed: true // Always available
    }
  ];

  const handleConnect = async (connector: 'metamask' | 'walletconnect') => {
    clearError();
    await connectWallet(connector);
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{formatAddress(account)}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect your wallet to access Web3 features on ADA4Career
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.connector}
                variant="outline"
                className="flex items-center justify-start gap-3 h-12"
                onClick={() => handleConnect(wallet.connector)}
                disabled={!wallet.installed || isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="text-2xl">{wallet.icon}</span>
                )}
                <div className="flex flex-col items-start">
                  <span className="font-medium">{wallet.name}</span>
                  {!wallet.installed && (
                    <span className="text-xs text-gray-500">Not installed</span>
                  )}
                  {wallet.connector === 'walletconnect' && (
                    <span className="text-xs text-gray-500">Coming soon</span>
                  )}
                </div>
              </Button>
            ))}
          </div>

          <div className="text-xs text-gray-500 text-center">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WalletConnectButton;