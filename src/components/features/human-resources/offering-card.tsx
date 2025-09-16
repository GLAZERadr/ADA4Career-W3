import { ArrowRight, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { JobPostingWithApplicants } from '@/types/response/job';

type OfferingCardProps = {
  offering: JobPostingWithApplicants;
  onViewApplicants?: () => void;
  onDelete?: () => void;
};

const OfferingCard = ({
  offering,
  onViewApplicants,
  onDelete,
}: OfferingCardProps) => {
  return (
    <div className='flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow md:flex-row md:items-center'>
      <div className='flex items-start gap-4 md:flex-1'>
        <div className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-slate-50'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={offering.logo || '/placeholder.svg'}
              alt={offering.company ?? 'Company logo'}
              className='object-contain'
            />
            <AvatarFallback className='text-xs'>
              {offering.company
                ? offering.company.substring(0, 2).toUpperCase()
                : 'CO'}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className='flex-1'>
          <h4 className='font-semibold'>{offering.division}</h4>
          <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground'>
            <span>{offering.company}</span>
            <span className='text-xs'>•</span>
            <span>{offering.department}</span>
            <Badge variant='outline' className='ml-1'>
              {offering.stage}
            </Badge>
          </div>
          <div className='flex items-center gap-2 mt-3'>
            <Badge className='mt-2'>
              {offering.applicants?.length ?? '0'} applied
            </Badge>
            <Badge className='mt-2 bg-indigo-600'>
              {offering.appliedApplicant?.length ?? '0'} need to review
            </Badge>
            <Badge className='mt-2 bg-green-500'>
              {offering.acceptedApplicant?.length ?? '0'} accepted
            </Badge>
            <Badge className='mt-2 bg-red-500'>
              {offering.rejectedApplicant?.length ?? '0'} rejected
            </Badge>
          </div>
        </div>
      </div>
      <div className='flex items-center gap-2 self-end md:self-center'>
        <Link href={`offerings/${offering.id}`}>
          <Button
            variant='outline'
            className='h-9 gap-1'
            onClick={onViewApplicants}
          >
            <User className='h-4 w-4' />
            Applicant Details
            <ArrowRight className='h-4 w-4' />
          </Button>
        </Link>
        <Button
          variant='destructive'
          size='icon'
          className='h-9 w-9'
          onClick={onDelete}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
};

export default OfferingCard;
