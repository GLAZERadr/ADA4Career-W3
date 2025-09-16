'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Use dynamic import with ssr: false to prevent server-side rendering
const CVResult = dynamic(
  () => import('@/app/[locale]/onboarding/jobseeker/cv-result'),
  {
    ssr: false,
  }
);

const Page = () => {
  return (
    <div>
      <CVResult />
    </div>
  );
};

export default Page;
