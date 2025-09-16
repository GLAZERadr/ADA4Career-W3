'use client';
import React, { useEffect } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

const KeyboardNavigationDialog: React.FC = () => {
  const { openKeyboardDialog, toggleOpenKeyboardDialog } =
    useAccessibilityStore();

  // Close dialog when X key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (openKeyboardDialog && e.key.toLowerCase() === 'x') ||
        (openKeyboardDialog && e.key === 'Enter')
      ) {
        toggleOpenKeyboardDialog();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openKeyboardDialog]);

  return (
    <Dialog open={openKeyboardDialog} onOpenChange={toggleOpenKeyboardDialog}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Keyboard Navigation</DialogTitle>
          <DialogDescription>
            You've activated keyboard navigation mode
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='font-medium'>Key</div>
            <div className='font-medium'>Navigation</div>

            <div className='font-mono bg-gray-100 px-2 py-1 rounded text-center'>
              B
            </div>
            <div>Navigate between buttons</div>

            <div className='font-mono bg-gray-100 px-2 py-1 rounded text-center'>
              H
            </div>
            <div>Navigate between headers</div>

            <div className='font-mono bg-gray-100 px-2 py-1 rounded text-center'>
              G
            </div>
            <div>Navigate between graphics (images/videos)</div>

            <div className='font-mono bg-gray-100 px-2 py-1 rounded text-center'>
              F
            </div>
            <div>Navigate between form elements</div>

            <div className='font-mono bg-gray-100 px-2 py-1 rounded text-center'>
              M
            </div>
            <div>Navigate between menu items</div>

            <div className='font-mono bg-gray-100 px-2 py-1 rounded text-center'>
              X
            </div>
            <div>Close this dialog</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardNavigationDialog;
