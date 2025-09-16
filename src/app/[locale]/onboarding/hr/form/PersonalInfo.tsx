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

import { HumanResourcesSectionProps } from '@/app/[locale]/onboarding/form.types';

const PersonalInfo = ({ form }: HumanResourcesSectionProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name='personalInfo.fullName'
        render={({ field }) => (
          <FormItem className='w-full items-start flex flex-col'>
            <FormLabel>Full Name *</FormLabel>
            <FormControl>
              <Input placeholder='Enter your full name' {...field} />
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
            <FormLabel>Age *</FormLabel>
            <FormControl>
              <Input type='number' placeholder='19' {...field} />
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
            <FormLabel>Gender *</FormLabel>
            <FormControl>
              <Select {...field} onValueChange={field.onChange}>
                <SelectTrigger className='w-full text-start p-2 border border-gray-200 rounded-md'>
                  <SelectValue placeholder='Select gender' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
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
            <FormLabel>Residence Location *</FormLabel>
            <FormControl>
              <Input placeholder='Bandung, Indonesia' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PersonalInfo;
