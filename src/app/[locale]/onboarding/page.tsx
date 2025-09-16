'use client';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import api from '@/lib/axios';

import DisabilityTest from '@/app/[locale]/onboarding/disability/disability-test';
import HRFormPage from '@/app/[locale]/onboarding/hr/hr-onboard';
import JobSeekerFormPage from '@/app/[locale]/onboarding/jobseeker/jobseeker-onboard';
import { API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';
import { UserInterface } from '@/types/entities/user.types';
import { DisabilityResponse } from '@/types/response/disability';

const OnboardingPage = () => {
  const router = useRouter();
  const { data, isPending } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const meResponse = await api.get<ApiReturn<UserInterface>>(
        `${API_BASE_URL}/me`
      );
      return meResponse;
    },
  });

  const {
    data: disabilityData,
    isPending: isLoadingDisability,
    refetch,
  } = useQuery({
    queryKey: ['disability'],
    queryFn: async () => {
      try {
        const response = await api.get<ApiReturn<DisabilityResponse>>(
          `${API_BASE_URL}/questionnaire/${data?.data.data.email}`
        );
        return response;
      } catch (err) {
        // console.error(err);
      }
    },
    enabled: data?.data.data.email != undefined,
  });

  const renderOnboard = () => {
    // console.log(data?.data.data);
    // console.log(disabilityData?.data);
    if (data?.data.data.role[0] == 'jobseeker') {
      if (disabilityData?.data == undefined) {
        return <DisabilityTest refetch={refetch} />;
      } else {
        if (data.data.data.gender == '') {
          return <JobSeekerFormPage />;
        } else {
          router.replace('/onboarding/jobseeker/result');
        }
      }
    } else {
      return <HRFormPage />;
    }
  };

  if (isPending || isLoadingDisability) {
    return (
      <div className='w-screen h-screen flex items-center justify-center'>
        <LoaderCircleIcon className='h-20 w-20 animate-spin' />
      </div>
    );
  }

  return <div>{renderOnboard()}</div>;
};

export default OnboardingPage;
