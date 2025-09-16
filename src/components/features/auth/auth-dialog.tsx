'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useState } from 'react';

import WalletLoginButton from '@/components/features/auth/wallet-login-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Create a separate component for the parts that use useSearchParams
function AuthDialogContent() {
  const t = useTranslations('LandingPage');
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check URL parameters for auth type
    const authParam = searchParams.get('auth');
    if (authParam === 'login' || authParam === 'register') {
      setOpen(true);
    }
  }, [searchParams]);

  const openDialog = () => {
    setOpen(true);
  };

  const handleAuthSuccess = () => {
    console.log('AuthDialog: handleAuthSuccess called, closing dialog...');
    setOpen(false);

    // Force cleanup of any dialog elements after state change
    setTimeout(() => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
      dialogs.forEach(dialog => {
        if (dialog.parentElement) {
          dialog.parentElement.remove();
        }
      });
      overlays.forEach(overlay => overlay.remove());
    }, 50);
  };

  return (
    <>
      <div className='space-x-4'>
        <Button onClick={openDialog}>Sign In</Button>
      </div>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          console.log('Dialog onOpenChange:', newOpen);
          setOpen(newOpen);
        }}
      >
        <DialogContent className=''>
          <DialogHeader>
            <DialogTitle>
              Sign In
            </DialogTitle>
            <DialogDescription>
              Sign in to your account to access your dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-center">
            <WalletLoginButton onSuccess={handleAuthSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Main component with Suspense boundary
export default function AuthDialog() {
  const t = useTranslations('LandingPage');
  return (
    <Suspense
      fallback={
        <div className='space-x-4'>
          <Button disabled>Loading...</Button>
        </div>
      }
    >
      <AuthDialogContent />
    </Suspense>
  );
}
