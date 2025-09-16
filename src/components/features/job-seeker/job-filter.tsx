'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl'; // Import useTranslations
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { JobType, WorkplaceType } from '@/types/response/job';

interface JobFiltersProps {
  filters: {
    division: string;
    jobType: JobType | 'all';
    workplaceType: WorkplaceType | 'all';
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      division: string;
      jobType: JobType | 'all';
      workplaceType: WorkplaceType | 'all';
    }>
  >;
}

export default function JobFilters({ filters, setFilters }: JobFiltersProps) {
  const t = useTranslations('Jobs.Filters'); // Add translation hook
  const tJobTypes = useTranslations('Jobs.Card.jobTypes'); // Add job types translation hook

  const resetFilters = () => {
    setFilters({
      division: '',
      jobType: 'all',
      workplaceType: 'all',
    });
  };

  return (
    <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm'>
      <div className='grid gap-4 md:grid-cols-3'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400' />
          <Input
            placeholder={t('searchByDivision')}
            className='pl-9'
            value={filters.division}
            onChange={(e) =>
              setFilters({ ...filters, division: e.target.value })
            }
          />
        </div>

        <Select
          value={filters.jobType}
          onValueChange={(value) =>
            setFilters({ ...filters, jobType: value as JobType | 'all' })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('jobType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allJobTypes')}</SelectItem>
            <SelectItem value='full_time'>{tJobTypes('full_time')}</SelectItem>
            <SelectItem value='part_time'>{tJobTypes('part_time')}</SelectItem>
            <SelectItem value='contract'>{tJobTypes('contract')}</SelectItem>
            <SelectItem value='fixed_term'>
              {tJobTypes('fixed_term')}
            </SelectItem>
            <SelectItem value='casual'>{tJobTypes('casual')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.workplaceType}
          onValueChange={(value) =>
            setFilters({
              ...filters,
              workplaceType: value as WorkplaceType | 'all',
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('workplaceType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allWorkplaceTypes')}</SelectItem>
            <SelectItem value='remote'>
              {useTranslations('Jobs.Card.workplaceTypes')('remote')}
            </SelectItem>
            <SelectItem value='hybrid'>
              {useTranslations('Jobs.Card.workplaceTypes')('hybrid')}
            </SelectItem>
            <SelectItem value='on_site'>
              {useTranslations('Jobs.Card.workplaceTypes')('on_site')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(filters.division ||
        filters.jobType !== 'all' ||
        filters.workplaceType !== 'all') && (
        <div className='mt-4 flex justify-end'>
          <Button
            variant='outline'
            size='sm'
            onClick={resetFilters}
            className='flex items-center gap-1'
          >
            <X className='h-4 w-4' />
            {t('clearFilters')}
          </Button>
        </div>
      )}
    </div>
  );
}
