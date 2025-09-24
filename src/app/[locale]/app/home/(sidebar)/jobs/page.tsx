'use client';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl'; // Import useTranslations
import React from 'react';

import api from '@/lib/axios';

import JobCard from '@/components/features/job-seeker/job-card';
import JobFilters from '@/components/features/job-seeker/job-filter';

import useAuthStore from '@/store/useAuthStore';

import { API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';
import { PaginatedResponse } from '@/types/pagination.types';
import {
  JobPostingDataExtended,
  JobType,
  WorkplaceType,
} from '@/types/response/job';

const HomePage = () => {
  const t = useTranslations('Jobs.HomePage'); // Add translation hook
  const { user } = useAuthStore();

  // Dummy job data for demo purposes
  const dummyJobs: JobPostingDataExtended[] = [
    {
      id: '1',
      email: 'jobs@web3innovations.com',
      division: 'Engineering',
      job_type: 'full_time',
      workplace_type: 'hybrid',
      start_date: '2024-02-01',
      end_date: '2025-02-01',
      responsibilities: 'Lead development of cutting-edge DeFi protocols and smart contract solutions. Architect and implement blockchain-based financial systems.',
      qualification: '- 5+ years of blockchain development experience\\n- Proficiency in Solidity and smart contract development\\n- Experience with DeFi protocols and Web3 technologies\\n- Strong knowledge of Ethereum and Layer 2 solutions',
      additional_image_url: '',
      company: 'Web3 Innovations Inc.',
      location: 'San Francisco, CA',
      experience: 'Senior',
      stage: 'Open',
      disability_friendly: true,
      inclusive_hiring_statement: 'We are an equal opportunity employer committed to diversity and inclusion.',
      accessibility_level: 'high',
      accommodations: [
        { id: '1', type: 'workplace', description: 'Remote work options' },
        { id: '2', type: 'schedule', description: 'Flexible hours' }
      ],
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      match_percentage: 85,
      matching_skills: ['Blockchain Development', 'Solidity', 'DeFi', 'Web3', 'Smart Contracts'],
      missing_skills: ['Rust'],
      score_breakdown: {
        skills_score: 32,
        skills_reasoning: 'Strong match with blockchain development, Solidity, and DeFi experience. Missing Rust knowledge.',
        experience_score: 25,
        experience_reasoning: 'Senior level experience aligns well with 5+ years requirement.',
        expectations_score: 18,
        expectations_reasoning: 'Salary and work-life balance expectations match well.',
        accessibility_score: 10,
        accessibility_reasoning: 'Perfect match for accessibility requirements and remote work preferences.'
      }
    },
    {
      id: '2',
      email: 'careers@securechain.com',
      division: 'Security',
      job_type: 'full_time',
      workplace_type: 'remote',
      start_date: '2024-02-15',
      end_date: '2025-02-15',
      responsibilities: 'Audit smart contracts and ensure the safety of DeFi protocols. Conduct security analysis and vulnerability assessments.',
      qualification: '- 3+ years of smart contract security experience\\n- Expertise in Solidity and security analysis tools\\n- Knowledge of common vulnerabilities and attack vectors\\n- Experience with formal verification methods',
      additional_image_url: '',
      company: 'SecureChain Audits',
      location: 'Remote',
      experience: 'Mid-level',
      stage: 'Open',
      disability_friendly: true,
      inclusive_hiring_statement: 'We welcome applications from all backgrounds and encourage diversity.',
      accessibility_level: 'high',
      accommodations: [
        { id: '1', type: 'workplace', description: 'Fully remote' },
        { id: '2', type: 'accessibility', description: 'Screen reader compatible tools' }
      ],
      created_at: '2024-01-10',
      updated_at: '2024-01-12',
      match_percentage: 78,
      matching_skills: ['Smart Contract Security', 'Solidity', 'Vulnerability Assessment', 'Code Review'],
      missing_skills: ['Formal Verification', 'Mythril'],
      score_breakdown: {
        skills_score: 28,
        skills_reasoning: 'Good match with security analysis and Solidity expertise. Missing some formal verification tools.',
        experience_score: 22,
        experience_reasoning: 'Mid-level experience meets the 3+ years requirement.',
        expectations_score: 16,
        expectations_reasoning: 'Remote work preference aligns perfectly.',
        accessibility_score: 10,
        accessibility_reasoning: 'Excellent match for accessibility requirements.'
      }
    },
    {
      id: '3',
      email: 'jobs@defisolutions.com',
      division: 'Engineering',
      job_type: 'full_time',
      workplace_type: 'on_site',
      start_date: '2024-03-01',
      end_date: '2025-03-01',
      responsibilities: 'Build user-friendly interfaces for DeFi platform using React and Web3 technologies. Create intuitive experiences for cryptocurrency users.',
      qualification: '- 3+ years of React development experience\\n- Experience with Web3 libraries (ethers.js, web3.js)\\n- Knowledge of DeFi protocols and cryptocurrency\\n- Strong understanding of responsive design',
      additional_image_url: '',
      company: 'DeFi Solutions',
      location: 'New York, NY',
      experience: 'Mid-level',
      stage: 'Open',
      disability_friendly: true,
      inclusive_hiring_statement: 'We are committed to building a diverse and inclusive team.',
      accessibility_level: 'medium',
      accommodations: [
        { id: '1', type: 'workplace', description: 'Adjustable workspace' },
        { id: '2', type: 'accessibility', description: 'Assistive technology support' }
      ],
      created_at: '2024-01-08',
      updated_at: '2024-01-08',
      match_percentage: 72,
      matching_skills: ['React', 'JavaScript', 'Web3', 'Frontend Development'],
      missing_skills: ['TypeScript', 'GraphQL'],
      score_breakdown: {
        skills_score: 26,
        skills_reasoning: 'Strong React and Web3 experience. Missing TypeScript and GraphQL knowledge.',
        experience_score: 20,
        experience_reasoning: 'Frontend experience meets the 3+ years requirement.',
        expectations_score: 15,
        expectations_reasoning: 'On-site work may not align with remote work preferences.',
        accessibility_score: 8,
        accessibility_reasoning: 'Good accessibility support with room for improvement.'
      }
    }
  ];

  const { data, isPending, error } = useQuery<JobPostingDataExtended[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      // Always use dummy data for demo purposes
      console.log('Using dummy jobs data for demo');
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      return dummyJobs;
    },
    retry: false, // Don't retry on error
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  const [filters, setFilters] = React.useState({
    division: '',
    jobType: 'all' as JobType | 'all',
    workplaceType: 'all' as WorkplaceType | 'all',
  });

  if (isPending) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (error) {
    console.error('Jobs page error:', error);
    // Fallback to dummy data if there's an error
    return (
      <div className=''>
        <div className='flex flex-col items-start mb-8'>
          <div>
            <JobFilters filters={filters} setFilters={setFilters} />
          </div>
          <div className='flex flex-col gap-y-8 mt-4 w-full'>
            {dummyJobs.map((job, idx) => (
              <JobCard job={job} onClick={clickHandler} key={idx} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className=''>
        <div className='flex flex-col items-start mb-8'>
          <div>
            <JobFilters filters={filters} setFilters={setFilters} />
          </div>
          <div className='flex flex-col gap-y-8 mt-4 w-full'>
            {dummyJobs.map((job, idx) => (
              <JobCard job={job} onClick={clickHandler} key={idx} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredJobs = data?.filter((job) => {
    if (
      filters.division &&
      !job.division.toLowerCase().includes(filters.division.toLowerCase())
    ) {
      return false;
    }
    if (filters.jobType !== 'all' && job.job_type !== filters.jobType) {
      return false;
    }
    if (
      filters.workplaceType !== 'all' &&
      job.workplace_type !== filters.workplaceType
    ) {
      return false;
    }
    return true;
  });

  const clickHandler = () => {
    return;
  };

  return (
    <div className=''>
      <div className='flex flex-col items-start mb-8'>
        <div>
          {/* <div className='flex items-center gap-x-2'>
            <BriefcaseBusiness className='w-8 h-8 text-blue-600 mr-3' />
            <h1 className='text-3xl font-bold text-gray-900'>
              Jobs Recommendation
            </h1>
          </div> */}
          <JobFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className='flex flex-col gap-y-8 mt-4 w-full'>
          {filteredJobs ? (
            <>
              {filteredJobs.map((d, idx) => (
                <JobCard job={d} onClick={clickHandler} key={idx} />
              ))}
            </>
          ) : (
            <div>{t('noJobVacancies')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
