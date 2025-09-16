import React from 'react';

import JobDetailSection from '@/components/features/job-seeker/job-detail-section';

const JobDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <JobDetailSection id={id} />;
};

export default JobDetailPage;
