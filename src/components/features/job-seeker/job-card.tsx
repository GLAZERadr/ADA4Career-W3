'use client';

import {
  Accessibility,
  ArrowRight,
  Award,
  Briefcase,
  Building,
  Calendar,
  Clock,
  MapPin,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { isRecent, smartTimeFormat } from '@/lib/luxon';

import { CircularProgressIndicator } from '@/components/features/job-seeker/circular-progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { JobPostingDataExtended } from '@/types/response/job';

interface JobCardProps {
  job: JobPostingDataExtended;
  onClick: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const t = useTranslations('Jobs.Card');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Use translations for job type labels
  const jobTypeLabels = {
    full_time: t('jobTypes.full_time'),
    part_time: t('jobTypes.part_time'),
    contract: t('jobTypes.contract'),
    fixed_term: t('jobTypes.fixed_term'),
    casual: t('jobTypes.casual'),
  };

  // Use translations for workplace type labels
  const workplaceTypeLabels = {
    remote: t('workplaceTypes.remote'),
    hybrid: t('workplaceTypes.hybrid'),
    on_site: t('workplaceTypes.on_site'),
  };

  // Use translations for accessibility level labels
  const accessibilityLevelLabels = {
    high: t('accessibilityLevels.high'),
    medium: t('accessibilityLevels.medium'),
    standard: t('accessibilityLevels.standard'),
  };

  // Get first few qualification points
  const qualifications = job.qualification
    .split('\\n')
    .map((item) => item.replace(/^- /, '').trim())
    .filter(Boolean)
    .slice(0, 3);

  // Get first few accommodations (if available)
  const accommodations = job.accommodations?.slice(0, 2) || [];

  // Score breakdown data
  const scoreBreakdown = job.score_breakdown || {
    skills_score: 0,
    experience_score: 0,
    expectations_score: 0,
    accessibility_score: 0,
  };

  return (
    <Card className='overflow-hidden border-0 shadow-md'>
      <div className='flex flex-col md:flex-row relative'>
        {/* Left section */}
        <div className='flex-1 p-6 bg-white relative'>
          <div className='flex justify-between items-start mb-4'>
            <div className='flex gap-2'>
              <Badge variant='outline' className='text-xs font-normal'>
                {smartTimeFormat(job.created_at ?? '')}
              </Badge>
              {isRecent(job.created_at ?? '') ? (
                <Badge
                  variant='outline'
                  className='text-xs font-normal text-blue-500 border-blue-200 bg-blue-50'
                >
                  {t('earlyApplicant')}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className='flex gap-3 mb-4'>
            <div className='w-10 h-10 rounded-md bg-amber-50 flex items-center justify-center'>
              <span className='text-amber-600 font-semibold text-lg'>
                {job.division.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className='text-lg font-semibold'>{job.division}</h3>
              <p className='text-sm text-gray-500'>
                {job.company || 'TechCorp'} / {job.department || job.division} -{' '}
                {job.stage || 'Growing'}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-y-2 gap-x-4 mt-6 text-sm'>
            <div className='flex items-center gap-2 text-gray-600'>
              <MapPin className='h-4 w-4' />
              <span>{job.location || 'Remote Available'}</span>
            </div>
            <div className='flex items-center gap-2 text-gray-600'>
              <Building className='h-4 w-4' />
              <span>{workplaceTypeLabels[job.workplace_type]}</span>
            </div>
            <div className='flex items-center gap-2 text-gray-600'>
              <Clock className='h-4 w-4' />
              <span>{jobTypeLabels[job.job_type]}</span>
            </div>
            <div className='flex items-center gap-2 text-gray-600'>
              <Calendar className='h-4 w-4' />
              <span>{job.experience || '1+ years exp'}</span>
            </div>
          </div>

          {/* Accessibility section */}
          <div className='mt-4 pt-4 border-t'>
            <div className='flex items-center gap-2 mb-2'>
              <Accessibility className='h-5 w-5 text-green-600' />
              <span className='font-medium text-green-600'>
                {job.accessibility_level
                  ? accessibilityLevelLabels[job.accessibility_level]
                  : t('disabilityFriendly')}
              </span>
            </div>
            {accommodations.length > 0 ? (
              <div className='text-sm text-gray-600'>
                <p className='mb-2'>{t('accommodationsInclude')}</p>
                <ul className='list-disc pl-5 space-y-2'>
                  {accommodations.map((accommodation, index) => (
                    <li key={index}>{accommodation.description}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className='text-sm text-gray-600'>
                No Accommodation Got Listed
              </div>
            )}
          </div>

          {/* Score Breakdown Overlay */}
          {showBreakdown && (
            <div className='absolute inset-0 items-stretch justify-center bg-black/80 text-white p-6 flex flex-col transition-all duration-300 overflow-y-auto'>
              {/* <h3 className='text-xl font-semibold mb-6 text-center'>
                Score Breakdown
              </h3> */}

              <div className='grid sm:grid-cols-4 grid-cols-2 gap-6'>
                {/* Skills Score */}
                <div className='flex flex-col items-center'>
                  <CircularProgressIndicator
                    percentage={scoreBreakdown.skills_score || 0}
                    size={90}
                    strokeWidth={8}
                    maxScore={40}
                    text='Skills'
                    colors={['#10b981']}
                    segments={[1]}
                  />
                  <div className='mt-2 flex items-center gap-1'>
                    <Award className='h-4 w-4 text-green-400' />
                    <span className='text-xs text-green-400'>Skills Match</span>
                  </div>
                </div>

                {/* Experience Score */}
                <div className='flex flex-col items-center'>
                  <CircularProgressIndicator
                    percentage={scoreBreakdown.experience_score || 0}
                    size={90}
                    strokeWidth={8}
                    text='Experience'
                    maxScore={30}
                    colors={['#3b82f6']}
                    segments={[1]}
                  />
                  <div className='mt-2 flex items-center gap-1'>
                    <Briefcase className='h-4 w-4 text-blue-400' />
                    <span className='text-xs text-blue-400'>
                      Experience Match
                    </span>
                  </div>
                </div>

                {/* Expectations Score */}
                <div className='flex flex-col items-center'>
                  <CircularProgressIndicator
                    percentage={scoreBreakdown.expectations_score || 0}
                    size={90}
                    strokeWidth={8}
                    text='Expectations'
                    maxScore={20}
                    colors={['#f59e0b']}
                    segments={[1]}
                  />
                  <div className='mt-2 flex items-center gap-1'>
                    <Target className='h-4 w-4 text-amber-400' />
                    <span className='text-xs text-amber-400'>
                      Expectations Match
                    </span>
                  </div>
                </div>

                {/* Accessibility Score */}
                <div className='flex flex-col items-center'>
                  <CircularProgressIndicator
                    percentage={scoreBreakdown.accessibility_score || 0}
                    size={90}
                    strokeWidth={8}
                    text='Accessibility'
                    colors={['#ec4899']}
                    maxScore={10}
                    segments={[1]}
                  />
                  <div className='mt-2 flex items-center gap-1'>
                    <Accessibility className='h-4 w-4 text-pink-400' />
                    <span className='text-xs text-pink-400'>
                      Accessibility Match
                    </span>
                  </div>
                </div>
              </div>

              {/* <div className='mt-auto'>
                <p className='text-sm text-gray-300 mt-4'>
                  <span className='font-medium text-white'>Overall Match:</span>{' '}
                  {job.match_percentage}%
                </p>
                <div className='mt-2 text-xs text-gray-400'>
                  <p>Hover outside this area to close</p>
                </div>
              </div> */}
            </div>
          )}
        </div>

        {/* Right section */}
        <div
          className='w-full md:w-96 bg-gray-900 text-white p-6 flex flex-col relative'
          onMouseEnter={() => setShowBreakdown(true)}
          onMouseLeave={() => setShowBreakdown(false)}
        >
          <div className='flex flex-col items-center mb-6'>
            <CircularProgressIndicator
              percentage={job.match_percentage ?? 0}
              size={120}
              strokeWidth={12}
              maxScore={100}
            />
          </div>

          <h4 className='font-medium mb-3'>{t('required')}</h4>
          <ul className='space-y-2 mb-6 flex-1'>
            {qualifications.map((qualification, index) => (
              <li key={index} className='flex items-start gap-2 text-sm'>
                <span className='text-white mt-1'>•</span>
                <span>{qualification}</span>
              </li>
            ))}
          </ul>

          <Link href={`/app/home/jobs/${job.id}`}>
            <Button
              onClick={onClick}
              className='w-full justify-between bg-blue-500 hover:bg-blue-600'
            >
              {t('seeDetail')}
              <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
