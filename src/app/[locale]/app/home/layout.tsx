'use client';

import { useEffect, ReactNode } from 'react';

import useAuthStore from '@/store/useAuthStore';

export default function UserLayout({ children }: { children: ReactNode }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Set dummy user data instead of making API call
    const dummyUser = {
      id: 'demo_user_12345',
      email: 'demo@ada4career.com',
      name: 'Demo User',
      role: ['jobseeker'],
      gender: 'male',
      job_seeker_data: {
        skill: 'Web Development, React, JavaScript, Accessibility',
        experiences: 'Frontend Developer with 3+ years experience in accessible web development',
        expectations: 'Looking for inclusive remote opportunities in Web3 and blockchain technology',
        resume_url: 'demo-resume-url'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setUser(dummyUser);
  }, [setUser]);

  return children;
}
