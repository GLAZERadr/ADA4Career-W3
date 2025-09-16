import { useTranslations } from 'next-intl'; // Import useTranslations
import React from 'react';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { JobSeekerSectionProps } from '@/app/[locale]/onboarding/form.types';

const PersonalInfo = ({ form }: JobSeekerSectionProps) => {
  // Add translation hook
  const t = useTranslations('Onboarding.JobSeeker.PersonalInfo');

  return (
    <>
      <FormField
        control={form.control}
        name='personalInfo.fullName'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormLabel>{t('fullName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('fullNamePlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='personalInfo.age'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('age')}</FormLabel>
            <FormControl>
              <Input
                type='number'
                className='w-full'
                placeholder={t('agePlaceholder')}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='personalInfo.gender'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('gender')}</FormLabel>
            <FormControl>
              <Select {...field} onValueChange={field.onChange}>
                <SelectTrigger className='w-full text-start p-2 border border-gray-200 rounded-md'>
                  <SelectValue placeholder={t('genderPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='male'>{t('genderMale')}</SelectItem>
                    <SelectItem value='female'>{t('genderFemale')}</SelectItem>
                    <SelectItem value='other'>{t('genderOther')}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='personalInfo.address'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('address')}</FormLabel>
            <FormControl>
              <Input placeholder={t('addressPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PersonalInfo;
