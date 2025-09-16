import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { ApplicantWithJobDetails } from '@/types/response/job';

type Props = {
  applicants: ApplicantWithJobDetails[];
  onViewApplicants?: (offeringId: string) => void;
  onDelete?: (offeringId: string) => void;
};

const AcceptedOfferSection = ({
  applicants,
  onViewApplicants,
  onDelete,
}: Props) => {
  return (
    <div className='space-y-4'>
      {applicants.map((apl, idx) => (
        <>
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
              <h5>{apl.job_seeker_email}</h5>
            </div>
            <div>{apl.jobDetails?.department}</div>
            <div>{apl.jobDetails?.start_date}</div>
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
          </div>
          {applicants.length - 1 !== idx ? <Separator /> : null}
        </>
      ))}
    </div>
  );
};

export default AcceptedOfferSection;
