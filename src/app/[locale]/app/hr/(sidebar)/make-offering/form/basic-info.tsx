'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { JobPostingSectionProps } from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/form.types';

const BasicInfo = ({ form }: JobPostingSectionProps) => {
  return (
    <>
      <h2 className='text-2xl font-semibold mb-6'>Basic Information</h2>

      {/* <FormField
        control={form.control}
        name='basicInfo.email'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormLabel>Email*</FormLabel>
            <FormControl>
              <Input placeholder='contact@company.com' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
        {/* <FormField
          control={form.control}
          name='basicInfo.company'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name*</FormLabel>
              <FormControl>
                <Input placeholder='Company name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name='basicInfo.division'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division*</FormLabel>
              <FormControl>
                <Input placeholder='e.g. Software Engineering' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='basicInfo.department'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department (optional)</FormLabel>
              <FormControl>
                <Input placeholder='e.g. Frontend' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1  gap-4 w-full'>
        <FormField
          control={form.control}
          name='basicInfo.location'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (optional)</FormLabel>
              <FormControl>
                <Input placeholder='e.g. New York' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default BasicInfo;
