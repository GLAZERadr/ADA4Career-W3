'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Check, FileText, X } from 'lucide-react';
import { toast } from 'react-toastify';

import api from '@/lib/axios';

import { Applicant } from '@/components/features/human-resources/applicant-table/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { API_BASE_URL } from '@/constant/config';

export const columns: ColumnDef<Applicant>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const applicant = row.original;
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={applicant.avatar} alt={applicant.name} />
            <AvatarFallback>{applicant.name[0]}</AvatarFallback>
          </Avatar>
          <span className='font-medium'>{applicant.name}</span>
          <span className='text-xs text-muted-foreground'>
            {applicant.originalData?.job_seeker_email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'position',
    header: 'Division/Job',
    cell: ({ row }) => {
      const applicant = row.original;
      const jobDetails = applicant.originalData?.jobDetails;
      return (
        <div>
          <div className='font-medium'>{jobDetails?.division || 'Unknown'}</div>
          <div className='text-xs text-muted-foreground'>
            {jobDetails?.job_type?.replace('_', ' ')} •{' '}
            {jobDetails?.workplace_type?.replace('_', ' ')}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Applied Date',
  },
  {
    id: 'cover_letter',
    header: 'Cover Letter',
    cell: ({ row }) => {
      const coverLetter = row.original.originalData?.cover_letter;

      if (!coverLetter) {
        return <span className='text-muted-foreground'>No cover letter</span>;
      }

      // Truncate long cover letters
      const truncated =
        coverLetter.length > 50
          ? `${coverLetter.substring(0, 50)}...`
          : coverLetter;

      return <span title={coverLetter}>{truncated}</span>;
    },
  },
  {
    accessorKey: 'cvLink',
    header: 'Resume',
    cell: ({ row }) => {
      const applicant = row.original;
      // Only show resume link if it exists
      if (!applicant.originalData?.resume_url) {
        return <span className='text-muted-foreground'>No Resume</span>;
      }

      return (
        <a
          href={applicant.originalData?.resume_url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary hover:underline'
        >
          View Resume
        </a>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.originalData?.status;

      let statusColor = '';
      switch (status) {
        case 'applied':
          statusColor = 'bg-blue-100 text-blue-800';
          break;
        case 'reviewing':
          statusColor = 'bg-amber-100 text-amber-800';
          break;
        case 'accepted':
          statusColor = 'bg-green-100 text-green-800';
          break;
        case 'rejected':
          statusColor = 'bg-red-100 text-red-800';
          break;
        default:
          statusColor = 'bg-gray-100 text-gray-800';
      }

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => {
      const applicant = row.original;
      const originalData = applicant.originalData;

      const handleStatusChange = async (newStatus: 'accepted' | 'rejected') => {
        if (!originalData) return;

        try {
          await api.patch(
            `${API_BASE_URL}/job-applications/${originalData.id}/status`,
            {
              status: newStatus,
            }
          );

          toast.success(
            `Applicant ${
              newStatus === 'accepted' ? 'approved' : 'rejected'
            } successfully`
          );
          // You would typically refresh the data here
        } catch (error) {
          console.error('Failed to update status:', error);
          toast.error('Failed to update applicant status');
        }
      };

      return (
        <div className='flex gap-2'>
          <Button
            size='icon'
            variant='outline'
            className='h-8 w-8'
            onClick={() => {
              if (originalData?.resume_url) {
                window.open(originalData.resume_url, '_blank');
              } else {
                toast.error('No resume available');
              }
            }}
          >
            <span className='sr-only'>View CV</span>
            <FileText className='h-4 w-4' />
          </Button>
          <Button
            size='icon'
            className='h-8 w-8 bg-green-500 hover:bg-green-600'
            onClick={() => handleStatusChange('accepted')}
            disabled={originalData?.status === 'accepted'}
          >
            <span className='sr-only'>Approve</span>
            <Check className='h-4 w-4 text-white' />
          </Button>
          <Button
            size='icon'
            variant='destructive'
            className='h-8 w-8'
            onClick={() => handleStatusChange('rejected')}
            disabled={originalData?.status === 'rejected'}
          >
            <span className='sr-only'>Reject</span>
            <X className='h-4 w-4' />
          </Button>
        </div>
      );
    },
  },
];
