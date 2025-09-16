'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { ClipboardList, FileText, MessageSquareWarning } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { adaptToApplicantSchema } from '@/lib/job-adaptor';
import { useJobApplicants } from '@/hooks/hr/use-job-applicant';

import { columns } from '@/components/features/human-resources/applicant-table/column';
import { DataTable } from '@/components/features/human-resources/applicant-table/data-table';
import { Applicant } from '@/components/features/human-resources/applicant-table/schema';
import StatsCard from '@/components/features/human-resources/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import useAuthStore from '@/store/useAuthStore';

const companyInfo = {
  name: 'Company name',
  subtitle: 'Phoenix Recruitment',
  logo: '/placeholder.svg?height=48&width=48',
};

const HRDashboardPage = () => {
  const { user } = useAuthStore();
  const [tableData, setTableData] = useState<Applicant[]>([]);

  // Use your existing hook for fetching applicants
  const {
    data: applicantsWithDetails,
    isLoading,
    error,
  } = useJobApplicants(user?.email, { noCache: true });

  // Convert API data to table format
  useEffect(() => {
    if (applicantsWithDetails) {
      const adaptedData = adaptToApplicantSchema(applicantsWithDetails);
      setTableData(adaptedData);
    }
  }, [applicantsWithDetails]);

  // Calculate stats from your data
  const stats = {
    totalRegistrants: applicantsWithDetails?.length || 0,
    needReview:
      applicantsWithDetails?.filter(
        (app) => app.status === 'applied' || app.status === 'reviewing'
      ).length || 0,
    totalAccepted:
      applicantsWithDetails?.filter((app) => app.status === 'accepted')
        .length || 0,
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-[60vh]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='flex justify-center items-center h-[60vh] flex-col gap-4'>
        <div className='text-red-500 text-xl'>Error loading applicants</div>
        <div className='text-muted-foreground'>{error.message}</div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-6xl'>
      <div className='flex flex-col gap-y-6'>
        {/* Header */}
        <div className='grid grid-cols-4 gap-x-6'>
          <Card className='md:col-span-1'>
            <CardContent className='flex !py-6 flex-row items-center justify-center gap-4 pb-2'>
              <Avatar className='h-12 w-12'>
                <AvatarImage
                  src='/placeholder.svg?height=48&width=48'
                  alt={user?.human_resource_data?.company ?? 'Company logo'}
                />
                <AvatarFallback className='bg-slate-100'>
                  {user?.human_resource_data?.company
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h5 className='text-lg'>
                  {user?.human_resource_data?.company ?? 'Your Company'}
                </h5>
                <p className='text-sm text-muted-foreground'>
                  {user?.human_resource_data?.position ?? 'Human Resources'}
                </p>
              </div>
            </CardContent>
          </Card>
          <StatsCard
            title='Total Applicants'
            value={stats.totalRegistrants}
            icon={<ClipboardList className='text-amber-500 h-4 w-4' />}
          />
          <StatsCard
            title='Need Review'
            value={stats.needReview}
            icon={<FileText className='text-blue-500 h-4 w-4' />}
          />
          <StatsCard
            title='Accepted'
            value={stats.totalAccepted}
            icon={<MessageSquareWarning className='text-green-500 h-4 w-4' />}
          />
        </div>

        {/* Table */}
        <div className='bg-card p-6 w-full border rounded-md shadow'>
          <div className='flex items-center justify-between'>
            <h4>All Applicants</h4>
            <Link href='/app/hr/offerings'>
              <Button variant='link' className='text-blue-500 underline'>
                See All
              </Button>
            </Link>
          </div>
          <div className='mt-4'>
            {tableData.length > 0 ? (
              <DataTable columns={columns} data={tableData} />
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                No applicants found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboardPage;
