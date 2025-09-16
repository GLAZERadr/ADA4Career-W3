import React from 'react';

import ApplicantDetailSection from '@/components/features/human-resources/applicant-detail-section';

// import OfferingDetailSection from '@/components/features/human-resources/offering-detail-section';

const ApplicantDetailPage = async ({
  params,
}: {
  params: Promise<{ aplid: string }>;
}) => {
  const { aplid } = await params;
  return <ApplicantDetailSection id={aplid} />;
};

export default ApplicantDetailPage;
