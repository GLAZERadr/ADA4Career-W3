'use client';

import React, { useState } from 'react';
import { Coins } from 'lucide-react';

import { Button } from '@/components/ui/button';
import TokenPurchaseModal from './token-purchase-modal';

interface BuyTokensButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const BuyTokensButton: React.FC<BuyTokensButtonProps> = ({
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Coins className="h-4 w-4" />
        <span className="hidden sm:inline">Buy Tokens</span>
      </Button>

      <TokenPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default BuyTokensButton;