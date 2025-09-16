'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl'; // Import useTranslations
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import api from '@/lib/axios';
import { getCookie } from '@/lib/cookies-action';

import AdaLogo from '@/components/ada-logo';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';

import {
  expectationSchema,
  JobSeekerData,
  jobSeekerSchema,
  personalInfoSchema,
  skillExperienceSchema,
} from '@/app/[locale]/onboarding/form.types';
import Expectation from '@/app/[locale]/onboarding/jobseeker/form/Expectation';
import PersonalInfo from '@/app/[locale]/onboarding/jobseeker/form/PersonalInfo';
import SkillExperience from '@/app/[locale]/onboarding/jobseeker/form/SkillExperience';
import { API_BASE_URL } from '@/constant/config';

import { ApiError, ApiReturn } from '@/types/api.types';

const JobSeekerFormPage = () => {
  // Add translation hook
  const t = useTranslations('Onboarding.JobSeeker');

  const [step, setStep] = React.useState(1);
  const [isValidating, setIsValidating] = React.useState(false);

  // Use useFieldArray for dynamic fields
  const form = useForm<JobSeekerData>({
    resolver: zodResolver(jobSeekerSchema),
    mode: 'onTouched', // This enables validation as fields change
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const router = useRouter();

  const { mutateAsync: mutateAsyncUptData, isPending } = useMutation<
    ApiReturn<null>,
    ApiError,
    z.infer<typeof jobSeekerSchema>
  >({
    mutationFn: async (data) => {
      const email = (await getCookie('ada4career-email'))?.value;

      const personalData = {
        name: data.personalInfo.fullName,
        age: parseInt(data.personalInfo.age),
        address: data.personalInfo.address,
        gender: data.personalInfo.gender,
      };

      const jobseekerData = {
        skill: data.skillExperience.skill.join(', '),
        experiences: data.skillExperience.experience,
        expectations: data.expectation.expectation,
      };

      // console.log(personalData);
      // console.log(jobseekerData);

      const response = await api.post(
        `${API_BASE_URL}/user/role/${email}`,
        jobseekerData
      );

      await api.post(`${API_BASE_URL}/user/update/${email}`, personalData);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(t('successMessage'));
      router.push('/onboarding/jobseeker/result');
    },
  });

  const onSubmit = async (values: JobSeekerData) => {
    await mutateAsyncUptData(values);
  };

  // Function to validate current step before proceeding
  const validateStep = async () => {
    setIsValidating(true);

    let isValid = false;
    let personalData;
    let skillData;
    let expectationData;

    try {
      switch (step) {
        case 1:
          // Validate personal info
          personalData = form.getValues('personalInfo');
          await personalInfoSchema.parseAsync(personalData);
          isValid = true;
          break;
        case 2:
          // Validate skill experience
          skillData = form.getValues('skillExperience');
          await skillExperienceSchema.parseAsync(skillData);
          isValid = true;
          break;
        case 3:
          // Validate expectations (this is optional according to your schema)
          expectationData = form.getValues('expectation');
          await expectationSchema.parseAsync(expectationData);
          isValid = true;
          break;
        default:
          isValid = false;
      }
    } catch (error) {
      isValid = false;

      // Trigger form validation to show error messages
      form.trigger();

      toast.error(t('errorMessage'));
    }

    setIsValidating(false);
    return isValid;
  };
  // Handle next button click
  const handleNext = async () => {
    const isValid = await validateStep();

    if (isValid) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <PersonalInfo form={form} />;
      case 2:
        return <SkillExperience form={form} />;
      case 3:
        return <Expectation form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen w-screen py-8 px-4 overflow-x-clip flex items-center justify-center relative'>
      <div className='w-[560px] h-[560px] rounded-full blur-3xl -translate-x-48 -translate-y-20 absolute opacity-50 bg-orange-200 top-0 left-0' />
      <div className='w-[560px] h-[560px] rounded-full blur-3xl translate-x-48 translate-y-20 absolute opacity-50 bg-orange-200 bottom-0 right-0' />
      <div className='max-w-6xl mx-auto rounded-md bg-white z-10 p-6 w-full text-center shadow-md'>
        <div className='max-w-4xl mx-auto items-center flex flex-col p-4'>
          <AdaLogo width={56} height={56} />
          <h1 className='mt-4 mb-2'>{t('title')}</h1>
          <p>{t('desc')}</p>
          <div className='w-full text-orange-600 flex items-center mt-12 mb-6 gap-x-3'>
            <p className='font-medium'>
              {step}/{totalSteps}
            </p>
            <Progress value={progress} className='h-2' />
            <p className='font-semibold text-start flex-grow flex-1'>
              {t('yourProgress')}
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
              <div className='flex flex-col gap-y-8 items-start text-start justify-start w-full'>
                {renderStepContent()}
              </div>

              <footer className='flex justify-between mt-16'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => step > 1 && setStep(step - 1)}
                  disabled={step === 1}
                >
                  {t('previous')}
                </Button>
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={isValidating}
                >
                  {step === totalSteps ? t('submit') : t('next')}
                </Button>
              </footer>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerFormPage;
