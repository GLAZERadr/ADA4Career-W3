'use client';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2Icon,
  XCircleIcon,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import api from '@/lib/axios';
import { useApplicantStatus } from '@/hooks/hr/use-process-applicant';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';
import { JobApplicant, JobPostingDataExtended } from '@/types/response/job';

const OfferingDetailSection = ({ id }: { id: string }) => {
  const { data: offering, isPending } = useQuery({
    queryKey: ['offering-detail'],
    queryFn: async () => {
      const response = await api.get<ApiReturn<JobPostingDataExtended>>(
        `${API_BASE_URL}/job-vacancy/${id}`
      );
      return response.data.data;
    },
    refetchOnMount: true,
  });

  const {
    data: applicants,
    isPending: isPendingApplicants,
    refetch,
  } = useQuery({
    queryKey: ['offering-detail-list-applicants'],
    queryFn: async () => {
      const response = await api.get<ApiReturn<JobApplicant[]>>(
        `${API_BASE_URL}/job-applications/job-vacancy/${id}`
      );
      return response.data.data;
    },
    select: (data) => {
      return data.filter((applicant) => applicant.status === 'applied');
    },
  });

  const { acceptApplicant, rejectApplicant, isProcessing } =
    useApplicantStatus();

  const handleAccept = async (id: string) => {
    await acceptApplicant({ applicantId: id });
    refetch();
  };

  const handleReject = async (id: string) => {
    await rejectApplicant({ applicantId: id });
    refetch();
  };

  if (isPending || isPendingApplicants) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container mx-auto'>
      <Link href='/app/hr/offerings'>
        <Button size='lg'>
          <ArrowLeft />
          Back to Offerings
        </Button>
      </Link>
      <div className='flex mt-4 items-start gap-4 md:flex-1 border p-4 rounded'>
        <div className='flex h-10 w-10 items-center justify-center overflow-hidden  bg-slate-50'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={offering?.logo || '/placeholder.svg'}
              alt={offering?.company ?? 'Company logo'}
              className='object-contain'
            />
            <AvatarFallback className='text-xs'>
              {offering?.company
                ? offering?.company.substring(0, 2).toUpperCase()
                : 'CO'}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className='flex-1'>
          <h4 className='font-semibold'>{offering?.division}</h4>
          <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground'>
            <span>{offering?.company}</span>
            <span className='text-xs'>•</span>
            <span>{offering?.department}</span>
            <Badge variant='outline' className='ml-1'>
              {offering?.stage}
            </Badge>
          </div>
          <Badge className='mt-2'>{offering?.job_type} applied</Badge>
        </div>
      </div>

      <div className='mt-6 flex flex-col gap-4'>
        {applicants?.length ? (
          applicants.map((apl, idx) => (
            <>
              <ApplicantCard
                apl={apl}
                offering={offering}
                onAccept={handleAccept}
                onReject={handleReject}
              />
              {idx != applicants.length - 1 && <Separator className='my-2' />}
            </>
          ))
        ) : (
          <div className='flex items-center justify-center text-xl text-gray-600 font-medium my-8'>
            No Applicant yet
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferingDetailSection;

type PropsAplicant = {
  apl: JobApplicant;
  offering: JobPostingDataExtended | undefined;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
};

export const ApplicantCard = ({
  apl,
  offering,
  onAccept,
  onReject,
}: PropsAplicant) => {
  const [showScoreDetails, setShowScoreDetails] = React.useState(false);

  // Calculate total score
  const totalScore =
    apl.skills_score +
    apl.experience_score +
    apl.expectations_score +
    apl.accessibility_score;

  // Max possible score (assuming these are the maximums)
  const maxScore = 100; // Adjust if your max score is different

  // Helper function to determine badge color based on score percentage
  const getScoreBadgeColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-green-500 hover:bg-green-600';
    if (percentage >= 60) return 'bg-blue-500 hover:bg-blue-600';
    if (percentage >= 40) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  return (
    <div className='flex flex-col gap-3 w-full'>
      {/* Main card content - keep your existing layout */}
      <div key={apl.id} className='grid grid-cols-7 justify-center'>
        <div className='flex items-center gap-2 col-span-2'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={apl.id || '/placeholder.svg'}
              alt={apl.id ?? 'Company logo'}
              className='object-contain'
            />
            <AvatarFallback className='text-xs'>
              {apl.job_seeker_email
                ? apl?.job_seeker_email.substring(0, 2).toUpperCase()
                : 'CO'}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <h5>{apl.job_seeker_email}</h5>
          </div>
        </div>
        <div>{offering?.department}</div>
        <div>{offering?.start_date}</div>
        <Link href={apl.resume_url}>
          <Button variant='link' className='underline'>
            Resume URL
          </Button>
        </Link>
        <Link href={`/app/hr/offerings/applicant/${apl.id}`}>
          <Button>
            Detail Applicant
            <ArrowRight />
          </Button>
        </Link>
        <div className='flex items-center gap-2 col-span-1 justify-center'>
          <Button
            onClick={() => onAccept(apl.id)}
            size='icon'
            className='bg-green-500'
          >
            <CheckCircle2Icon />
          </Button>
          <Button
            onClick={() => onReject(apl.id)}
            size='icon'
            className='bg-red-500'
          >
            <XCircleIcon />
          </Button>
        </div>
      </div>

      {/* Score overview section */}
      <div className='ml-12 flex items-center gap-2'>
        <div className='flex items-center gap-1'>
          {apl.match_percentage ? (
            <Badge
              className={`${getScoreBadgeColor(
                apl.match_percentage,
                100
              )} text-white`}
            >
              {apl.match_percentage}% Match
            </Badge>
          ) : null}
          <Badge variant='outline' className='bg-blue-50'>
            Skills: {apl.skills_score}/40
          </Badge>
          <Badge variant='outline' className='bg-blue-50'>
            Experience: {apl.experience_score}/30
          </Badge>
          <Badge variant='outline' className='bg-blue-50'>
            Expectations: {apl.expectations_score}/20
          </Badge>
          <Badge variant='outline' className='bg-blue-50'>
            Accessibility: {apl.accessibility_score}/10
          </Badge>
        </div>
      </div>
    </div>
  );
};
