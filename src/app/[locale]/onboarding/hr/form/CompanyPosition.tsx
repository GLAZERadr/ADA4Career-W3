import React from 'react';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { HumanResourcesSectionProps } from '@/app/[locale]/onboarding/form.types';

const CompanyPosition = ({ form }: HumanResourcesSectionProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name='companyAndPosition.company'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Company *</FormLabel>
            <FormControl>
              <Input placeholder='ADA4Career Indonesia' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='companyAndPosition.position'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position *</FormLabel>
            <FormControl>
              <Input placeholder='Product Engineer' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default CompanyPosition;
