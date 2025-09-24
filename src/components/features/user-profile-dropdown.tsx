import { useMutation } from '@tanstack/react-query';
import { Copy, LogOut, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl'; // Import useTranslations
import React from 'react';
import { toast } from 'react-toastify';

import api from '@/lib/axios';
import { removeToken, removeTokenEmail } from '@/lib/cookies';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import useAuthStore from '@/store/useAuthStore';
import { useWeb3 } from '@/contexts/Web3Context';

import { API_BASE_URL } from '@/constant/config';

const UserProfileDropdown = () => {
  const { user, logout } = useAuthStore();
  const { account, isConnected, disconnectWallet } = useWeb3();
  const t = useTranslations('Dashboard.UserProfile'); // Add translation hook

  const router = useRouter();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Address copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Address copied to clipboard!');
    }
  };

  const { isPending: isLoadingLogout, mutateAsync: logoutMutation } =
    useMutation({
      mutationFn: async () => {
        const resp = await api.post(`${API_BASE_URL}/logout`);
        return resp.data;
      },
    });

  const handleLogout = async () => {
    try {
      // Try to logout from backend, but don't fail if it doesn't work (demo mode)
      await logoutMutation();
    } catch (error) {
      console.warn('Backend logout failed (demo mode):', error);
      // Continue with client-side logout even if backend fails
    }

    // Disconnect wallet if connected
    if (isConnected) {
      disconnectWallet();
    }

    // Clear auth state and tokens
    logout();
    removeToken();
    removeTokenEmail();

    // Redirect to home
    router.replace('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='h-10 p-3 rounded-full gap-2 px-2'>
          <div className='flex items-center gap-2'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={user?.address} alt={user?.name} />
              <AvatarFallback>
                {isConnected && account
                  ? account.slice(2, 4).toUpperCase()
                  : user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='hidden flex-col items-start text-left md:flex'>
              <span className='text-sm truncate font-medium'>
                {user?.name || 'Demo User'}
              </span>
              <span className='text-xs truncate text-muted-foreground'>
                {isConnected && account
                  ? `${account.slice(0, 6)}...${account.slice(-4)}`
                  : user?.email || 'demo@ada4career.com'}
              </span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Wallet Address Section */}
        {isConnected && account && (
          <>
            <div className='px-2 py-2'>
              <div className='flex items-center gap-2 mb-2'>
                <Wallet className='h-4 w-4 text-blue-600' />
                <span className='text-sm font-medium text-gray-700'>Wallet Address</span>
              </div>
              <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-md'>
                <code className='text-xs font-mono text-gray-800 flex-1 break-all'>
                  {account}
                </code>
                <button
                  onClick={() => copyToClipboard(account)}
                  className='flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors'
                  title='Copy address'
                >
                  <Copy className='h-3 w-3 text-gray-600' />
                </button>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* User Email */}
        {user?.email && (
          <>
            <div className='px-2 py-2'>
              <div className='text-sm text-gray-500'>Email</div>
              <div className='text-sm font-medium text-gray-800'>{user.email}</div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          disabled={isLoadingLogout}
          onClick={handleLogout}
          className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>{isLoadingLogout ? t('loggingOut') : t('logOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
