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

const Media = ({ form }: JobPostingSectionProps) => {
  return (
    <>
      <h2 className='text-2xl font-semibold mb-6'>Media & Images</h2>

      <FormField
        control={form.control}
        name='media.logo'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormLabel>Company Logo URL (optional)</FormLabel>
            <FormControl>
              <Input placeholder='https://example.com/logo.png' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='media.additional_image_url'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormLabel>Additional Image URL (optional)</FormLabel>
            <FormControl>
              <Input placeholder='https://example.com/image.jpg' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default Media;
