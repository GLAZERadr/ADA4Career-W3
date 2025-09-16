'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import api from '@/lib/axios';
import { setToken, setTokenEmail } from '@/lib/cookies';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import useAuthStore from '@/store/useAuthStore';
import { handleAuthSuccessRedirect } from '@/lib/auth-utils';

import { API_BASE_URL } from '@/constant/config';

import { ApiError, ApiReturn } from '@/types/api.types';
import { UserInterface } from '@/types/entities/user.types';
import { RegisterAndLoginResponse } from '@/types/response/auth';

interface LoginFormProps {
  onRegisterClick: () => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  email: z
    .string()
    .min(2)
    .max(50)
    .email({ message: 'Please input valid email' }),
  password: z.string().min(8).max(50),
});

export function LoginForm({ onRegisterClick, onSuccess: onSuccessCallback }: LoginFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { login } = useAuthStore();

  const { mutateAsync, isPending } = useMutation<
    ApiReturn<RegisterAndLoginResponse>,
    AxiosError<ApiError>,
    z.infer<typeof formSchema>
  >({
    mutationFn: async (data) => {
      const dataLogin = {
        email: data.email,
        password: data.password,
      };

      const loginResponse = await api.post(
        `${API_BASE_URL}/user/login`,
        dataLogin
      );

      const token = loginResponse.data.data.token;
      setToken(token);
      setTokenEmail(loginResponse.data.data.email);
      const meResponse = await api.get<ApiReturn<UserInterface>>(
        `${API_BASE_URL}/me`
      );
      const meData = meResponse.data.data;
      login({
        ...meData,
        token: token,
      });

      return loginResponse.data;
    },

    onSuccess: (data) => {
      toast.success('Login success', {
        ariaLabel: 'Login success',
        role: 'alert',
      });

      // Call success callback to close dialog
      if (onSuccessCallback) {
        onSuccessCallback();
      }

      // Use the robust redirect utility function
      handleAuthSuccessRedirect('/en/app/home/jobs');
    },
    onError: (error) => {
      if (error.response?.data.message) {
        toast.error(error.response?.data.data, {
          ariaLabel: 'Login failed - Incorrect email or password',
          role: 'alert',
        });
      } else {
        toast.error('Something went wrong', {
          ariaLabel: 'Login failed',
          role: 'alert',
        });
      }
    },
  });

  const t = useTranslations('LandingPage');

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await mutateAsync(values);
  };

  return (
    <div className='space-y-4 py-2'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='Enter your email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder='' type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex items-center space-x-2'>
            <Checkbox id='remember' />
            <Label htmlFor='remember' className='text-sm font-normal'>
              {t('rememberMe')}
            </Label>
          </div>
          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? 'Signing in...' : t('signIn')}
          </Button>

          <div className='mt-4 text-center flex items-center  justify-center'>
            <p className='text-sm text-muted-foreground'>{t('notAlready')}</p>
            <Button
              type='button'
              variant='link'
              onClick={onRegisterClick}
              className='w-fit p-1 underline'
            >
              {t('createAccount')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
