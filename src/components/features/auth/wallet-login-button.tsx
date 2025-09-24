'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Wallet, Loader2, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import useAuthStore from '@/store/useAuthStore';

// No external auth services needed for demo

interface WalletLoginButtonProps {
  onSuccess?: () => void;
}

export function WalletLoginButton({ onSuccess }: WalletLoginButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

  const {
    isConnected,
    account,
    connectWallet,
    error: web3Error,
    clearError
  } = useWeb3();

  const { login } = useAuthStore();

  const handleWalletAuth = async () => {
    try {
      clearError();
      setIsConnecting(true);

      // Step 1: Connect wallet if not connected
      if (!isConnected) {
        await connectWallet('metamask');

        // Wait a bit for the connection to settle
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setIsConnecting(false);
      setIsAuthenticating(true);

      // Step 2: Simple demo authentication (no backend required)
      console.log('Demo wallet authentication - no backend needed');

      // Create demo user data
      const userData = {
        id: `demo_${account!.slice(-8)}`,
        email: `${account!.slice(0, 6).toLowerCase()}@web3demo.local`,
        role: ['jobseeker'],
        gender: 'male',
        walletAddress: account!,
        token: `demo_token_${Date.now()}`,
        authMethod: 'wallet' as const,
        job_seeker_data: {
          skill: 'Web3 Development, Blockchain',
          experiences: 'Demo experience with blockchain development',
          expectations: 'Looking for Web3 opportunities',
          resume_url: 'demo-resume-url'
        }
      };

      console.log('Setting demo user data:', userData);
      login(userData);

      toast.success('Successfully authenticated with wallet!', {
        ariaLabel: 'Wallet authentication successful',
        role: 'alert',
      });

      console.log('Wallet auth success! Redirecting to CV Builder for Web3 demo...');

      // Call success callback to close dialog
      if (onSuccess) {
        console.log('Calling onSuccess callback...');
        onSuccess();
      }

      // Direct redirect to Web3 demo page
      setTimeout(() => {
        console.log('Redirecting to Web3 Demo...');
        window.location.href = '/en/web3-demo';
      }, 500);

    } catch (error: any) {
      console.error('Wallet authentication error:', error);

      let errorMessage = 'Failed to authenticate with wallet';

      if (error.message?.includes('User rejected')) {
        errorMessage = 'Wallet connection was rejected';
      } else if (error.message?.includes('No wallet')) {
        errorMessage = 'No wallet detected. Please install MetaMask.';
      } else if (error.message?.includes('signature')) {
        errorMessage = 'Signature verification failed';
      }

      toast.error(errorMessage, {
        ariaLabel: 'Wallet authentication failed',
        role: 'alert',
      });
    } finally {
      setIsConnecting(false);
      setIsAuthenticating(false);
    }
  };

  const getButtonContent = () => {
    if (isConnecting) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Connecting Wallet...
        </>
      );
    }

    if (isAuthenticating) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Authenticating...
        </>
      );
    }

    if (isConnected && account) {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          Sign in with {account.slice(0, 6)}...{account.slice(-4)}
        </>
      );
    }

    return (
      <>
        <Wallet className="h-4 w-4 mr-2" />
        Sign in with Wallet
      </>
    );
  };

  const getButtonVariant = () => {
    if (isConnected && account) return 'default';
    return 'outline';
  };

  return (
    <div className="space-y-2 w-full">
      <Button
        onClick={handleWalletAuth}
        disabled={isConnecting || isAuthenticating}
        variant={getButtonVariant()}
        className="w-full justify-center"
      >
        {getButtonContent()}
      </Button>

      {web3Error && (
        <p className="text-sm text-red-600 text-center">
          {web3Error}
        </p>
      )}

      {isConnected && account && (
        <div className="text-xs text-center text-muted-foreground">
          <p>Connected to Lisk Sepolia Testnet</p>
          <p className="font-mono break-all">{account}</p>
        </div>
      )}
    </div>
  );
}

export default WalletLoginButton;