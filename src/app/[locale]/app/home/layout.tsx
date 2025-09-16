'use client';

import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';

import api from '@/lib/axios';

import useAuthStore from '@/store/useAuthStore';

import { API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';
import { UserInterface } from '@/types/entities/user.types';

export default function UserLayout({ children }: { children: ReactNode }) {
  const { setUser } = useAuthStore();

  const { isPending } = useQuery<ApiReturn<UserInterface>>({
    queryKey: ['me'],
    queryFn: async () => {
      const meResponse = await api.get<ApiReturn<UserInterface>>(
        `${API_BASE_URL}/me`
      );

      setUser(meResponse.data.data);
      return meResponse.data;
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  return children;
}
