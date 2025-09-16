'use client';

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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { JobPostingSectionProps } from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/form.types';

const JobDetails = ({ form }: JobPostingSectionProps) => {
  return (
    <>
      <h2 className='text-2xl font-semibold mb-6'>Job Details</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
        <FormField
          control={form.control}
          name='jobDetails.job_type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select job type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='full_time'>Full Time</SelectItem>
                  <SelectItem value='part_time'>Part Time</SelectItem>
                  <SelectItem value='contract'>Contract</SelectItem>
                  <SelectItem value='fixed_term'>Fixed Term</SelectItem>
                  <SelectItem value='casual'>Casual</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='jobDetails.workplace_type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workplace Type*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select workplace type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='remote'>Remote</SelectItem>
                  <SelectItem value='hybrid'>Hybrid</SelectItem>
                  <SelectItem value='on_site'>On Site</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
        <FormField
          control={form.control}
          name='jobDetails.experience'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience (optional)</FormLabel>
              <FormControl>
                <Input placeholder='e.g. 3-5 years' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='jobDetails.stage'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stage (optional)</FormLabel>
              <FormControl>
                <Input placeholder='e.g. Application Stage' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
        <FormField
          control={form.control}
          name='jobDetails.start_date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date*</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='jobDetails.end_date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date (optional)</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default JobDetails;
