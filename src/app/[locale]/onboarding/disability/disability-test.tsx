'use client';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  EarIcon,
  EyeIcon,
  HandHeart,
  HandIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { toast } from 'react-toastify';

import api from '@/lib/axios';
import { getCookie } from '@/lib/cookies-action';

import AdaLogo from '@/components/ada-logo';
import { ChoiceGroup, ChoiceItem } from '@/components/chooice-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

import { API_BASE_URL } from '@/constant/config';

import { ApiError, ApiReturn } from '@/types/api.types';

// Define types for our questions and answers
interface DisabilityType {
  id: string;
  label: string;
}

interface Answer {
  type: string;
  impairmentType: string;
  customImpairmentType?: string;
  description?: string;
}

type ImpairmentData = {
  [key: string]: Answer; // Kategori bisa apa saja, tidak terbatas pada hearing, visual, dll
};

const impairmentIcons = {
  visual: <EyeIcon />,
  hearing: <EarIcon />,
  mute: <AudioLines />,
  motoric: <HandIcon />,
  mental: <HandHeart />,
};

function transformData(
  jsonData: ImpairmentData
): { question: string; answer: string }[] {
  const result: { question: string; answer: string }[] = [];

  // Loop melalui semua kategori (hearing, visual, mute, dll)
  for (const category in jsonData) {
    if (Object.prototype.hasOwnProperty.call(jsonData, category)) {
      const details = jsonData[category];
      const type = details.type;
      const impairmentType = details.impairmentType;
      const customImpairmentType = details.customImpairmentType;
      const description = details.description;

      // Tentukan impairment type yang digunakan
      const specificImpairmentType =
        impairmentType === 'Other' ? customImpairmentType : impairmentType;

      // Tentukan kalimat yang akan dimasukkan dalam `answer`
      const answer = `i have ${type} disabilities, which more specifically is ${specificImpairmentType}. ${
        description ? 'more detail is ' + description : ''
      }`;

      // Tambahkan question dan answer ke array hasil
      result.push({
        question: `Tell me more detail about your ${type} disabilities`,
        answer: answer,
      });
    }
  }

  return result;
}

const DisabilityTest = ({ refetch }: { refetch: () => void }) => {
  const t = useTranslations('Onboarding.Disability');
  const tImpairments = useTranslations('Onboarding.Disability.Impairments');

  const disabilityTypes: DisabilityType[] = [
    { id: 'visual', label: t('visual') },
    { id: 'hearing', label: t('hearing') },
    { id: 'mute', label: t('mute') },
    { id: 'motoric', label: t('motoric') },
    { id: 'mental', label: t('mental') },
  ];

  // Default impairment types for each disability
  const impairmentOptions = {
    visual: [
      tImpairments('visual.lowVision'),
      tImpairments('visual.colorBlindness'),
      tImpairments('visual.blindness'),
      tImpairments('visual.other'),
    ],
    hearing: [
      tImpairments('hearing.moderateHearingLoss'),
      tImpairments('hearing.severeHearingLoss'),
      tImpairments('hearing.deaf'),
      tImpairments('hearing.other'),
    ],
    mute: [
      tImpairments('mute.moderateSpeechImpairment'),
      tImpairments('mute.severeSpeechImpairment'),
      tImpairments('mute.nonVerbal'),
      tImpairments('mute.other'),
    ],
    motoric: [
      tImpairments('motoric.limitedMobility'),
      tImpairments('motoric.fineMotorControlIssues'),
      tImpairments('motoric.coordinationIssues'),
      tImpairments('motoric.other'),
    ],
    mental: [
      tImpairments('mental.anxietyDepression'),
      tImpairments('mental.adhdAutism'),
      tImpairments('mental.ptsdOcd'),
      tImpairments('mental.other'),
    ],
  };
  // State for tracking selected disability types and step progress
  const [selectedDisabilities, setSelectedDisabilities] = React.useState<
    string[]
  >([]);

  const [currentDisabilityIndex, setCurrentDisabilityIndex] =
    React.useState<number>(-1);
  const [answers, setAnswers] = React.useState<Record<string, Answer>>({});
  const [customType, setCustomType] = React.useState<string>('');

  // Determine the current step (0 = initial selection, 1+ = disability forms)
  const currentStep =
    currentDisabilityIndex === -1 ? 0 : currentDisabilityIndex + 1;

  // Total steps (initial selection + one for each selected disability)
  const totalSteps = selectedDisabilities.length;

  // Current disability being processed
  const currentDisability =
    currentDisabilityIndex >= 0 &&
    currentDisabilityIndex < selectedDisabilities.length
      ? selectedDisabilities[currentDisabilityIndex]
      : '';

  // Handle selection of disability types (multiple selection)
  const handleDisabilitySelection = (value: string | string[]) => {
    // Ensure we're working with an array since this is multiple selection
    const selectedValues = Array.isArray(value) ? value : [value];
    setSelectedDisabilities(selectedValues);
  };

  // Handle impairment type selection
  const handleImpairmentSelection = (value: string | string[]) => {
    // Since we're using "single" mode, we can safely cast the value to string
    const selectedValue = typeof value === 'string' ? value : value[0] || '';

    setAnswers((prev) => ({
      ...prev,
      [currentDisability]: {
        ...(prev[currentDisability] || {}),
        type: currentDisability,
        impairmentType: selectedValue,
      },
    }));
  };

  // Handle custom impairment type input
  const handleCustomImpairmentChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomType(e.target.value);
    setAnswers((prev) => ({
      ...prev,
      [currentDisability]: {
        ...(prev[currentDisability] || {}),
        type: currentDisability,
        impairmentType: 'Other',
        customImpairmentType: e.target.value,
      },
    }));
  };

  // Handle description textarea input
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [currentDisability]: {
        ...(prev[currentDisability] || {}),
        type: currentDisability,
        impairmentType: prev[currentDisability]?.impairmentType || '',
        description: e.target.value,
      },
    }));
  };

  // Get current values for the form
  const getCurrentImpairmentType = () => {
    return answers[currentDisability]?.impairmentType || '';
  };

  const getCurrentDescription = () => {
    return answers[currentDisability]?.description || '';
  };

  const { mutateAsync, isPending } = useMutation<
    ApiReturn<null>,
    ApiError,
    {
      question: string;
      answer: string;
    }[]
  >({
    mutationFn: async (data) => {
      const email = await getCookie('ada4career-email');

      const dataToSend = {
        email: email?.value,
        answers: data,
      };

      // console.log(dataToSend, 'ini dikirim');

      const response = await api.post(
        `${API_BASE_URL}/questionnaire`,
        dataToSend
      );

      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Disability Questionnaire submitted successfully!');
      refetch();
    },
  });

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        setCurrentDisabilityIndex(0);
      } else if (currentDisabilityIndex < selectedDisabilities.length - 1) {
        // Move to the next disability form
        setCurrentDisabilityIndex((prev) => prev + 1);
        setCustomType('');
      } else {
        // Completed all forms, submit

        const transformedDataPerDisability = transformData(answers);
        const structured = [
          {
            question: t('haveDisability'),
            answer: 'Yes',
          },
          {
            question: t('whatType'),
            answer: selectedDisabilities.join(', '),
          },
          ...transformedDataPerDisability,
        ];
        await mutateAsync(structured);
      }
    } catch (error) {
      console.error('Error submitting disability questionnaire:', error);
    }
  };

  // Check if the current form is valid and the Next button can be enabled
  const isNextEnabled = () => {
    if (currentStep === 0) {
      return selectedDisabilities.length > 0;
    }

    const currentAnswer = answers[currentDisability];
    // console.log('f1');
    if (!currentAnswer?.impairmentType) {
      // console.log('f1');
      return false;
    }

    // If "Other" is selected, custom type must be provided
    if (
      currentAnswer.impairmentType === 'Other' &&
      !currentAnswer.customImpairmentType
    ) {
      // console.log(currentAnswer);
      return false;
    }

    return true;
  };

  const handlePrevious = () => {
    if (currentDisabilityIndex > 0) {
      // Move to the previous disability form
      setCurrentDisabilityIndex((prev) => prev - 1);
      // Reset custom type if applicable
      if (
        answers[selectedDisabilities[currentDisabilityIndex - 1]]
          ?.impairmentType === 'Other'
      ) {
        setCustomType(
          answers[selectedDisabilities[currentDisabilityIndex - 1]]
            ?.customImpairmentType || ''
        );
      } else {
        setCustomType('');
      }
    } else if (currentDisabilityIndex === 0) {
      // Go back to the initial disability selection screen
      setCurrentDisabilityIndex(-1);
    }
  };

  // Check if the previous button should be disabled
  const isPreviousEnabled = () => {
    return currentStep > 0;
  };

  return (
    <div className='min-h-screen w-full flex items-center justify-center relative overflow-hidden flex-col px-4 py-8 md:py-12'>
      {/* Background decorations - made responsive and reduced opacity for better contrast */}
      <div className='w-64 h-64 sm:w-96 sm:h-96 md:w-[560px] md:h-[560px] rounded-full blur-3xl -translate-x-1/4 -translate-y-20 absolute opacity-30 bg-orange-200 top-0 left-0' />
      <div className='w-64 h-64 sm:w-96 sm:h-96 md:w-[560px] md:h-[560px] rounded-full blur-3xl translate-x-1/4 translate-y-20 absolute opacity-30 bg-orange-200 bottom-0 right-0' />

      {/* Main content container - adjusted for better responsiveness */}
      <div className='max-w-6xl mx-auto rounded-md bg-white z-10 w-full text-center shadow-md'>
        <div className='w-full max-w-4xl mx-auto items-center flex flex-col p-4 sm:p-6 md:p-8'>
          {/* Logo with proper alt text for screen readers */}
          <div aria-hidden='false'>
            <AdaLogo width={64} height={64} />
          </div>

          {/* Properly structured headings for screen readers */}
          <h1
            className='mt-4 mb-2 text-xl sm:text-2xl md:text-3xl'
            id='form-title'
          >
            {t('title')}
          </h1>
          <p className='text-sm sm:text-base'>{t('desc')}</p>

          {/* Progress section with improved accessibility */}
          <div className='w-full text-orange-600 flex flex-col sm:flex-row items-center mt-8 mb-6 gap-y-2 gap-x-3'>
            <p className='font-medium' aria-live='polite'>
              {t('step', {
                currentStep: currentStep + 1,
                totalStep: totalSteps + 1,
              })}
            </p>
            <Progress
              value={((currentStep + 1) / (totalSteps + 1)) * 100}
              className='h-2 w-full'
              aria-label={`${t('progress')}: ${Math.round(
                ((currentStep + 1) / (totalSteps + 1)) * 100
              )}%`}
            />
            <p className='font-semibold text-start flex-grow flex-1'>
              {t('yourProgress')}
            </p>
          </div>

          {/* Step 0: Initial Disability Selection with accessibility improvements */}
          {currentStep === 0 && (
            <div
              className='w-full mt-6'
              role='region'
              aria-labelledby='disability-selection-heading'
            >
              <p
                className='font-bold mb-6 text-left'
                id='disability-selection-heading'
              >
                {t('selectType')}{' '}
                <span className='text-red-500' aria-hidden='true'>
                  *
                </span>
                <span className='sr-only'>(Required)</span>
              </p>
              <ChoiceGroup
                type='multiple'
                value={selectedDisabilities}
                onChange={handleDisabilitySelection}
                className='w-full mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
                variant={currentStep === 0 ? 'square' : 'default'}
                orientation={currentStep === 0 ? 'horizontal' : 'vertical'}
                aria-required='true'
              >
                {disabilityTypes.map((disability, index) => (
                  <ChoiceItem
                    key={disability.id}
                    icon={
                      currentStep === 0
                        ? impairmentIcons[
                            disability.id as keyof typeof impairmentIcons
                          ]
                        : undefined
                    }
                    value={disability.id}
                    label={disability.label}
                    index={String.fromCharCode(65 + index)}
                    aria-label={disability.label}
                  />
                ))}
              </ChoiceGroup>
            </div>
          )}

          {/* Disability Specific Forms with accessibility improvements */}
          {currentStep > 0 && currentDisability && (
            <div
              className='w-full mt-6'
              role='region'
              aria-labelledby='specific-disability-heading'
            >
              <p
                className='font-bold mb-4 text-left'
                id='specific-disability-heading'
              >
                {disabilityTypes.find((d) => d.id === currentDisability)?.label}{' '}
                {t('details')}
                <span className='font-normal text-sm ml-2'>
                  ({t('step', { currentStep, totalStep: totalSteps })})
                </span>
              </p>

              {/* Impairment Type Selection with improved accessibility */}
              <div className='mb-6'>
                <p
                  className='font-bold text-left mb-2'
                  id='impairment-selection-heading'
                >
                  {t('selectImpairment')}{' '}
                  <span className='text-red-500' aria-hidden='true'>
                    *
                  </span>
                  <span className='sr-only'>(Required)</span>
                </p>
                <ChoiceGroup
                  type='single'
                  value={getCurrentImpairmentType()}
                  onChange={handleImpairmentSelection}
                  className='w-full grid grid-cols-1 gap-2'
                  aria-labelledby='impairment-selection-heading'
                  aria-required='true'
                >
                  {impairmentOptions[
                    currentDisability as keyof typeof impairmentOptions
                  ].map((option, index) => (
                    <ChoiceItem
                      key={option}
                      value={option}
                      label={option}
                      index={String.fromCharCode(65 + index)}
                      aria-label={option}
                    />
                  ))}
                </ChoiceGroup>
              </div>

              {/* Custom Impairment Type Input with accessibility */}
              {getCurrentImpairmentType() === 'Other' && (
                <div className='mb-6'>
                  <label
                    htmlFor='custom-impairment'
                    className='font-bold text-left mb-2 block'
                  >
                    {t('specifyImpairment')}{' '}
                    <span className='text-red-500' aria-hidden='true'>
                      *
                    </span>
                    <span className='sr-only'>(Required)</span>
                  </label>
                  <Input
                    id='custom-impairment'
                    value={customType}
                    onChange={handleCustomImpairmentChange}
                    placeholder={t('impairmentPlaceholder')}
                    className='w-full'
                    required
                    aria-required='true'
                    aria-describedby='custom-impairment-desc'
                  />
                  <div id='custom-impairment-desc' className='sr-only'>
                    {t('impairmentInstructions')}
                  </div>
                </div>
              )}

              {/* Description Textarea with accessibility */}
              <div className='mb-6'>
                <label
                  htmlFor='additional-details'
                  className='font-bold text-left mb-2 block'
                >
                  {t('additionalDetails')}
                </label>
                <Textarea
                  id='additional-details'
                  value={getCurrentDescription()}
                  onChange={handleDescriptionChange}
                  placeholder={t('detailsPlaceholder')}
                  className='w-full min-h-24'
                  aria-describedby='details-desc'
                />
                <div id='details-desc' className='sr-only'>
                  {t('detailsInstructions')}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons with improved accessibility and responsiveness */}
          <div className='w-full mt-8 justify-between sm:justify-end gap-3 sm:gap-5 flex flex-col sm:flex-row'>
            <Button
              variant='ghost'
              className='text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 md:px-14 md:py-6 w-full sm:w-auto'
              onClick={handlePrevious}
              disabled={!isPreviousEnabled() || isPending}
              aria-label={t('previousStep')}
            >
              <ArrowLeft className='mr-2' aria-hidden='true' />
              {t('previous')}
            </Button>

            <Button
              className='text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 md:px-14 md:py-6 bg-blue-600 w-full sm:w-auto'
              onClick={handleNext}
              disabled={!isNextEnabled() || isPending}
              aria-label={
                currentStep === totalSteps - 1 ? t('submitForm') : t('nextStep')
              }
            >
              {currentStep === totalSteps - 1 ? t('submit') : t('next')}{' '}
              <ArrowRight className='ml-2' aria-hidden='true' />
            </Button>
          </div>

          {/* Accessibility information for screen readers */}
          <div className='sr-only' aria-live='polite'>
            {isPending ? t('loading') : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisabilityTest;
