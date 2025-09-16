import { useTranslations } from 'next-intl'; // Import useTranslations

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import type { JobSeekerSectionProps } from '@/app/[locale]/onboarding/form.types';

const Expectation = ({ form }: JobSeekerSectionProps) => {
  // Add translation hook
  const t = useTranslations('Onboarding.JobSeeker.Expectation');

  return (
    <>
      <FormField
        control={form.control}
        name='expectation.expectation'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('expectation')}</FormLabel>
            <FormControl>
              <Textarea placeholder={t('expectationPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default Expectation;
