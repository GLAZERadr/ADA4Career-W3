'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';

import { JobPostingSectionProps } from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/form.types';

const Inclusivity = ({ form }: JobPostingSectionProps) => {
  const [accommodationType, setAccommodationType] = useState('');
  const [accommodationDescription, setAccommodationDescription] = useState('');

  const addAccommodation = () => {
    if (!accommodationType || !accommodationDescription) return;

    const currentAccommodations =
      form.getValues('inclusivity.accommodations') || [];
    form.setValue('inclusivity.accommodations', [
      ...currentAccommodations,
      { type: accommodationType, description: accommodationDescription },
    ]);

    // Reset input fields
    setAccommodationType('');
    setAccommodationDescription('');
  };

  const removeAccommodation = (index: number) => {
    const currentAccommodations =
      form.getValues('inclusivity.accommodations') || [];
    form.setValue(
      'inclusivity.accommodations',
      currentAccommodations.filter((_, i) => i !== index)
    );
  };

  return (
    <>
      <h2 className='text-2xl font-semibold mb-6'>
        Inclusivity & Accessibility
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
        <FormField
          control={form.control}
          name='inclusivity.accessibility_level'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accessibility Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select level' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='high'>High</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='standard'>Standard</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='inclusivity.disability_friendly'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center space-x-3 space-y-0 mt-8'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Disability friendly workplace</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name='inclusivity.inclusive_hiring_statement'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormLabel>Inclusive Hiring Statement</FormLabel>
            <FormControl>
              <Textarea
                placeholder='Add your inclusive hiring statement here'
                className='min-h-24'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='w-full mt-6'>
        <h3 className='text-lg font-medium mb-2'>Accommodations</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <Input
              placeholder='Accommodation type'
              value={accommodationType}
              onChange={(e) => setAccommodationType(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder='Description'
              value={accommodationDescription}
              onChange={(e) => setAccommodationDescription(e.target.value)}
            />
          </div>
        </div>
        <Button
          type='button'
          onClick={addAccommodation}
          variant='outline'
          size='sm'
          className='mb-4'
        >
          Add Accommodation
        </Button>

        <div className='space-y-2'>
          {form
            .watch('inclusivity.accommodations')
            ?.map((accommodation, index) => (
              <div
                key={index}
                className='flex items-center justify-between bg-gray-50 p-2 rounded'
              >
                <div>
                  <span className='font-medium'>{accommodation.type}</span>:{' '}
                  {accommodation.description}
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => removeAccommodation(index)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default Inclusivity;
