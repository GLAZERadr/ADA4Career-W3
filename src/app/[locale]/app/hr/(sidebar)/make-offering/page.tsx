'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import api from '@/lib/axios';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';

import useAuthStore from '@/store/useAuthStore';

import BasicInfo from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/basic-info';
import {
  basicInfoSchema,
  inclusivitySchema,
  jobDescriptionSchema,
  jobDetailsSchema,
  JobPostingFormData,
  jobPostingSchema,
  mediaSchema,
} from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/form.types';
import Inclusivity from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/inclusivity';
import JobDescription from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/job-description';
import JobDetails from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/job-details';
import Media from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/media';
import Review from '@/app/[locale]/app/hr/(sidebar)/make-offering/review';
import { API_BASE_URL } from '@/constant/config';

import { ApiError } from '@/types/api.types';

const MakeOfferingPage = () => {
  const { user } = useAuthStore();
  const [step, setStep] = React.useState(1);
  const [isValidating, setIsValidating] = React.useState(false);

  const form = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    mode: 'onTouched',
    defaultValues: {
      basicInfo: {
        // email: '',
        // company: '',
        division: '',
        department: '',
        location: '',
      },
      jobDetails: {
        job_type: undefined,
        workplace_type: undefined,
        stage: '',
        experience: '',
        start_date: '',
        end_date: '',
      },
      jobDescription: {
        responsibilities: '',
        qualification: '',
      },
      inclusivity: {
        accessibility_level: undefined,
        disability_friendly: false,
        inclusive_hiring_statement: '',
        accommodations: [],
      },
      media: {
        logo: '',
        additional_image_url: '',
      },
    },
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const router = useRouter();

  const { mutateAsync: submitJobPosting, isPending } = useMutation<
    null,
    ApiError,
    JobPostingFormData
  >({
    mutationFn: async (data) => {
      // Transform form data to match API expectations
      const jobPostingData = {
        email: user?.email ?? '',
        division: data.basicInfo.division,
        job_type: data.jobDetails.job_type,
        workplace_type: data.jobDetails.workplace_type,
        start_date: data.jobDetails.start_date,
        end_date: data.jobDetails.end_date || '',
        responsibilities: data.jobDescription.responsibilities,
        qualification: data.jobDescription.qualification,
        additional_image_url: data.media.additional_image_url || '',

        // Extended fields
        company: user?.human_resource_data?.company ?? '',
        department: data.basicInfo.department,
        stage: data.jobDetails.stage,
        location: data.basicInfo.location,
        experience: data.jobDetails.experience,
        image: data.media.logo,
        accessibility_level: data.inclusivity.accessibility_level,
        accommodations: data.inclusivity.accommodations,
        disability_friendly: data.inclusivity.disability_friendly,
        inclusive_hiring_statement: data.inclusivity.inclusive_hiring_statement,
      };

      const formData = new FormData();

      // Menambahkan semua field ke formData
      Object.entries(jobPostingData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.post(`${API_BASE_URL}/job-vacancy`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return null;
    },
    onSuccess: () => {
      toast.success('Job posting created successfully!');
      router.push('/app/hr/dashboard'); // Redirect to job listings page
    },
    onError: (error) => {
      toast.error(`Error creating job posting: ${error.message}`);
    },
  });

  const onSubmit = async (values: JobPostingFormData) => {
    await submitJobPosting(values);
  };

  // Function to validate current step before proceeding
  const validateStep = async () => {
    setIsValidating(true);

    let isValid = false;

    try {
      switch (step) {
        case 1:
          // Validate basic info
          await basicInfoSchema.parseAsync(form.getValues('basicInfo'));
          isValid = true;
          break;
        case 2:
          // Validate job details
          await jobDetailsSchema.parseAsync(form.getValues('jobDetails'));
          isValid = true;
          break;
        case 3:
          // Validate job description
          await jobDescriptionSchema.parseAsync(
            form.getValues('jobDescription')
          );
          isValid = true;
          break;
        case 4:
          // Validate inclusivity
          await inclusivitySchema.parseAsync(form.getValues('inclusivity'));
          isValid = true;
          break;
        case 5:
          // Validate media
          await mediaSchema.parseAsync(form.getValues('media'));
          isValid = true;
          break;
        case 6:
          // Review step - no validation needed
          isValid = true;
          break;
        default:
          isValid = false;
      }
    } catch (error) {
      isValid = false;

      // Trigger form validation to show error messages
      form.trigger();

      toast.error('Please fill out all required fields correctly.');
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

  const getStepName = () => {
    switch (step) {
      case 1:
        return 'Basic Information';
      case 2:
        return 'Job Details';
      case 3:
        return 'Job Description';
      case 4:
        return 'Inclusivity & Accessibility';
      case 5:
        return 'Media & Images';
      case 6:
        return 'Review & Submit';
      default:
        return '';
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <BasicInfo form={form} />;
      case 2:
        return <JobDetails form={form} />;
      case 3:
        return <JobDescription form={form} />;
      case 4:
        return <Inclusivity form={form} />;
      case 5:
        return <Media form={form} />;
      case 6:
        return <Review form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen w-screen py-8 px-4 overflow-x-clip flex items-center justify-center relative'>
      <div className='w-[560px] h-[560px] rounded-full blur-3xl -translate-x-48 -translate-y-20 absolute opacity-50 bg-blue-200 top-0 left-0' />
      <div className='w-[560px] h-[560px] rounded-full blur-3xl translate-x-48 translate-y-20 absolute opacity-50 bg-blue-200 bottom-0 right-0' />
      <div className='max-w-6xl mx-auto rounded-md bg-white z-10 p-6 w-full text-center shadow-md'>
        <div className='max-w-4xl mx-auto items-center flex flex-col p-4'>
          <h1 className='text-3xl font-bold mt-4 mb-2'>Create Job Posting</h1>
          <p className='text-gray-600'>
            Fill out the form to create a new job posting
          </p>

          <div className='w-full text-blue-600 flex items-center mt-12 mb-6 gap-x-3'>
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
                  Previous
                </Button>
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={isValidating || isPending}
                >
                  {step === totalSteps
                    ? isPending
                      ? 'Submitting...'
                      : 'Submit'
                    : 'Next'}
                </Button>
              </footer>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default MakeOfferingPage;
