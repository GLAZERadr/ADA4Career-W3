import React from 'react';

import OfferingDetailSection from '@/components/features/human-resources/offering-detail-section';

// import OfferingDetailSection from '@/components/features/human-resources/offering-detail-section';

const OfferingDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <OfferingDetailSection id={id} />;
};

export default OfferingDetailPage;
