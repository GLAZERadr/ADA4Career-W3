'use client';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl'; // Import useTranslations
import React from 'react';

import api from '@/lib/axios';

import JobCard from '@/components/features/job-seeker/job-card';
import JobFilters from '@/components/features/job-seeker/job-filter';

import useAuthStore from '@/store/useAuthStore';

import { API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';
import { PaginatedResponse } from '@/types/pagination.types';
import {
  JobPostingDataExtended,
  JobType,
  WorkplaceType,
} from '@/types/response/job';

const HomePage = () => {
  const t = useTranslations('Jobs.HomePage'); // Add translation hook
  const { user } = useAuthStore();

  const { data, isPending } = useQuery<JobPostingDataExtended[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await api.get<
        ApiReturn<PaginatedResponse<JobPostingDataExtended>>
      >(`${API_BASE_URL}/job-vacancies/match/${user?.email}`);
      // console.log(response.data.data.items);
      return response.data.data.items;
      // return response.data.data.map((j) => {
      //   const exp = getRandomExperience();
      //   const cmp = getRandomCompany();
      //   const stg = getRandomStage();
      //   const loc = getRandomLocation();
      //   const sta = getRandomInclusiveStatement();
      //   const lvl = getRandomAccessibilityLevel();
      //   const aco = getRandomAccommodations();
      //   return {
      //     ...j,
      //     company: cmp,
      //     accommodations: aco,
      //     accessibility_level: lvl,
      //     inclusive_hiring_statement: sta,
      //     disability_friendly: true,
      //     experience: exp,
      //     location: loc,
      //     stage: stg,
      //   };
      // });
    },
  });

  const [filters, setFilters] = React.useState({
    division: '',
    jobType: 'all' as JobType | 'all',
    workplaceType: 'all' as WorkplaceType | 'all',
  });

  if (isPending || data === undefined) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  const filteredJobs = data?.filter((job) => {
    if (
      filters.division &&
      !job.division.toLowerCase().includes(filters.division.toLowerCase())
    ) {
      return false;
    }
    if (filters.jobType !== 'all' && job.job_type !== filters.jobType) {
      return false;
    }
    if (
      filters.workplaceType !== 'all' &&
      job.workplace_type !== filters.workplaceType
    ) {
      return false;
    }
    return true;
  });

  const clickHandler = () => {
    return;
  };

  return (
    <div className=''>
      <div className='flex flex-col items-start mb-8'>
        <div>
          {/* <div className='flex items-center gap-x-2'>
            <BriefcaseBusiness className='w-8 h-8 text-blue-600 mr-3' />
            <h1 className='text-3xl font-bold text-gray-900'>
              Jobs Recommendation
            </h1>
          </div> */}
          <JobFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className='flex flex-col gap-y-8 mt-4 w-full'>
          {filteredJobs ? (
            <>
              {filteredJobs.map((d, idx) => (
                <JobCard job={d} onClick={clickHandler} key={idx} />
              ))}
            </>
          ) : (
            <div>{t('noJobVacancies')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
