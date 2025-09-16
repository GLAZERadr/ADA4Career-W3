import { useMutation } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl'; // Import useTranslations
import React from 'react';

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

import { API_BASE_URL } from '@/constant/config';

const UserProfileDropdown = () => {
  const { user, logout } = useAuthStore();
  const t = useTranslations('Dashboard.UserProfile'); // Add translation hook

  const router = useRouter();

  const { isPending: isLoadingLogout, mutateAsync: logoutMutation } =
    useMutation({
      mutationFn: async () => {
        const resp = await api.post(`${API_BASE_URL}/logout`);
        return resp.data;
      },
    });

  const handleLogout = async () => {
    await logoutMutation();
    logout();
    removeToken();
    removeTokenEmail();
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
                {user?.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className='hidden flex-col items-start text-left md:flex'>
              <span className='text-sm truncate font-medium'>{user?.name}</span>
              <span className='text-xs truncate text-muted-foreground'>
                {user?.email}
              </span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isLoadingLogout}
          onClick={handleLogout}
          className='cursor-pointer !hover:bg-red-500'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>{isLoadingLogout ? t('loggingOut') : t('logOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
