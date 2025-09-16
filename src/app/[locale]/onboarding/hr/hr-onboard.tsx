'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from 'next/dist/server/api-utils';
import { useRouter } from 'next/navigation';
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
  companyAndPositionSchema,
  HRFormData,
  hrFormSchema,
  personalInfoSchema,
} from '@/app/[locale]/onboarding/form.types';
import CompanyPosition from '@/app/[locale]/onboarding/hr/form/CompanyPosition';
import PersonalInfo from '@/app/[locale]/onboarding/hr/form/PersonalInfo';
import { API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';

const HRFormPage = () => {
  const [step, setStep] = React.useState(1);
  const [isValidating, setIsValidating] = React.useState(false);

  // Use useFieldArray for dynamic fields
  const form = useForm<HRFormData>({
    resolver: zodResolver(hrFormSchema),
    mode: 'onTouched', // This enables validation as fields change
  });

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  const router = useRouter();

  const { mutateAsync: mutateAsyncUptData, isPending } = useMutation<
    ApiReturn<null>,
    ApiError,
    z.infer<typeof hrFormSchema>
  >({
    mutationFn: async (data) => {
      const email = (await getCookie('ada4career-email'))?.value;

      const personalData = {
        name: data.personalInfo.fullName,
        age: parseInt(data.personalInfo.age),
        address: data.personalInfo.address,
        gender: data.personalInfo.gender,
      };

      const humanResourcesData = {
        company: data.companyAndPosition.company,
        position: data.companyAndPosition.position,
      };

      const response = await api.post(
        `${API_BASE_URL}/user/role/${email}`,
        humanResourcesData
      );

      await api.post(`${API_BASE_URL}/user/update/${email}`, personalData);

      return response.data;
    },

    onSuccess: (data) => {
      toast.success('Data saved successfully');
      router.push('/app/hr/dashboard');
    },
  });

  const onSubmit = async (values: HRFormData) => {
    await mutateAsyncUptData(values);
    // console.log(values);
  };

  // Function to validate current step before proceeding
  const validateStep = async () => {
    setIsValidating(true);

    let isValid = false;
    let personalData;
    let skillData;

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
          skillData = form.getValues('companyAndPosition');
          await companyAndPositionSchema.parseAsync(skillData);
          isValid = true;
          break;
        default:
          isValid = false;
      }
    } catch (error) {
      isValid = false;

      // Trigger form validation to show error messages
      form.trigger();

      toast.error('Please fill out all fields correctly.');
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
        return <CompanyPosition form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen w-screen py-8 px-4 flex items-center justify-center relative overflow-hidden'>
      <div className='w-[560px] h-[560px] rounded-full blur-3xl -translate-x-48 -translate-y-20 absolute opacity-50 bg-orange-200 top-0 left-0' />
      <div className='w-[560px] h-[560px] rounded-full blur-3xl translate-x-48 translate-y-20 absolute opacity-50 bg-orange-200 bottom-0 right-0' />
      <div className='max-w-6xl mx-auto rounded-md bg-white z-10 p-6 w-full text-center shadow-md'>
        <div className='max-w-4xl mx-auto items-center flex flex-col p-4'>
          <AdaLogo width={56} height={56} />
          <h1 className='mt-4 mb-2'>Help Us Know You Better</h1>
          <p>We help you make a more accurate hiring</p>
          <div className='w-full text-orange-600 flex items-center mt-12 mb-6 gap-x-3'>
            <p className='font-medium'>
              {step}/{totalSteps}
            </p>
            <Progress value={progress} className='h-2' />
            <p className='font-semibold text-start flex-grow flex-1'>
              Your Progress
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
              <div className='flex flex-col text-start gap-y-8 items-start justify-start w-full'>
                {renderStepContent()}
              </div>

              <footer className='flex justify-between mt-16'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => step > 1 && setStep(step - 1)}
                  disabled={step === 1 || isPending}
                >
                  Previous
                </Button>
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={isValidating || isPending}
                >
                  {step === totalSteps ? 'Submit' : 'Next'}
                </Button>
              </footer>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default HRFormPage;
