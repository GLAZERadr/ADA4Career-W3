'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import { JobPostingSectionProps } from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/form.types';

const JobDescription = ({ form }: JobPostingSectionProps) => {
  return (
    <>
      <h2 className='text-2xl font-semibold mb-6'>Job Description</h2>

      <FormField
        control={form.control}
        name='jobDescription.responsibilities'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormLabel>Responsibilities*</FormLabel>
            <FormControl>
              <Textarea
                placeholder='Describe the main responsibilities for this role'
                className='min-h-32'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='jobDescription.qualification'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormLabel>Qualifications*</FormLabel>
            <FormControl>
              <Textarea
                placeholder='Describe the required qualifications for this role'
                className='min-h-32'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default JobDescription;
