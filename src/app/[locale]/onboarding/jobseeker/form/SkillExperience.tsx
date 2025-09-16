import { useTranslations } from 'next-intl'; // Import useTranslations

import ChipInput from '@/components/chip-input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import type { JobSeekerSectionProps } from '@/app/[locale]/onboarding/form.types';

const SkillExperience = ({ form }: JobSeekerSectionProps) => {
  // Add translation hook
  const t = useTranslations('Onboarding.JobSeeker.SkillExperience');

  // Common skill suggestions - keeping technical terms in English
  const skillSuggestions = [
    'Frontend',
    'Backend',
    'Fullstack',
    'Mobile',
    'DevOps',
    'Rust',
    'TypeScript',
    'IoT',
    'Cloud Computing',
    'UI/UX',
    'HTML',
    'Kotlin',
    'Flutter',
    'Swift',
    'Data Science',
  ];

  return (
    <>
      <FormField
        control={form.control}
        name='skillExperience.skill'
        render={({ field }) => (
          <FormItem className='w-full items-start flex flex-col'>
            <FormLabel>{t('skills')}</FormLabel>
            <FormControl>
              <ChipInput
                value={field.value || []}
                onChange={field.onChange}
                placeholder={t('skillsPlaceholder')}
                suggestions={skillSuggestions}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='skillExperience.experience'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('experience')}</FormLabel>
            <FormControl>
              <Textarea placeholder={t('experiencePlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default SkillExperience;
