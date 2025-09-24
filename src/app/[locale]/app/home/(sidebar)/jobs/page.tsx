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
      title: 'Senior Blockchain Developer',
      description: 'We are seeking a talented blockchain developer to join our Web3 team. Work on cutting-edge DeFi protocols and smart contract development.',
      division: 'Engineering',
      job_type: 'full-time',
      workplace_type: 'hybrid',
      salary_range: '$80,000 - $120,000',
      location: 'San Francisco, CA',
      company: 'Web3 Innovations Inc.',
      experience: 'Senior',
      stage: 'Open',
      disability_friendly: true,
      inclusive_hiring_statement: 'We are an equal opportunity employer committed to diversity and inclusion.',
      accessibility_level: 'High',
      accommodations: [{ description: 'Remote work options' }, { description: 'Flexible hours' }],
      qualification: '- 5+ years of blockchain development experience\\n- Proficiency in Solidity and smart contract development\\n- Experience with DeFi protocols and Web3 technologies\\n- Strong knowledge of Ethereum and Layer 2 solutions',
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
    {
      id: '2',
      title: 'Smart Contract Auditor',
      description: 'Join our security team to audit smart contracts and ensure the safety of DeFi protocols. Experience with Solidity and security tools required.',
      division: 'Security',
      job_type: 'full-time',
      workplace_type: 'remote',
      salary_range: '$90,000 - $140,000',
      location: 'Remote',
      company: 'SecureChain Audits',
      experience: 'Mid-level',
      stage: 'Open',
      disability_friendly: true,
      inclusive_hiring_statement: 'We welcome applications from all backgrounds and encourage diversity.',
      accessibility_level: 'High',
      accommodations: [{ description: 'Fully remote' }, { description: 'Screen reader compatible tools' }],
      qualification: '- 3+ years of smart contract security experience\\n- Expertise in Solidity and security analysis tools\\n- Knowledge of common vulnerabilities and attack vectors\\n- Experience with formal verification methods',
      created_at: '2024-01-10',
      updated_at: '2024-01-12',
    },
    {
      id: '3',
      title: 'Frontend Developer - DeFi Platform',
      description: 'Build user-friendly interfaces for our DeFi platform using React and Web3 technologies. Create intuitive experiences for cryptocurrency users.',
      division: 'Engineering',
      job_type: 'full-time',
      workplace_type: 'on-site',
      salary_range: '$70,000 - $100,000',
      location: 'New York, NY',
      company: 'DeFi Solutions',
      experience: 'Mid-level',
      stage: 'Open',
      disability_friendly: true,
      inclusive_hiring_statement: 'We are committed to building a diverse and inclusive team.',
      accessibility_level: 'Medium',
      accommodations: [{ description: 'Adjustable workspace' }, { description: 'Assistive technology support' }],
      qualification: '- 3+ years of React development experience\\n- Experience with Web3 libraries (ethers.js, web3.js)\\n- Knowledge of DeFi protocols and cryptocurrency\\n- Strong understanding of responsive design',
      created_at: '2024-01-08',
      updated_at: '2024-01-08',
    },
    {
      id: '4',
      title: 'Product Manager - Web3',
      description: 'Lead product development for our Web3 career platform. Define product strategy and work with engineering teams to deliver innovative solutions.',
      division: 'Product',
      job_type: 'full-time',
      workplace_type: 'hybrid',
      salary_range: '$95,000 - $130,000',
      location: 'Austin, TX',
      company: 'CareerChain',
      experience: 'Senior',
      stage: 'Open',
      disability_friendly: true,
      inclusive_hiring_statement: 'We value diverse perspectives and inclusive practices.',
      accessibility_level: 'High',
      accommodations: [{ description: 'Flexible schedule' }, { description: 'Remote work options' }],
      qualification: '- 5+ years of product management experience\\n- Experience in Web3 or fintech products\\n- Strong understanding of blockchain technology and DeFi\\n- Proven track record of leading cross-functional teams\\n- Experience with agile development methodologies',
      created_at: '2024-01-05',
      updated_at: '2024-01-05',
    },
    {
      id: '5',
      title: 'DevOps Engineer - Blockchain Infrastructure',
      description: 'Manage and scale blockchain infrastructure. Experience with Kubernetes, AWS, and blockchain nodes required.',
      division: 'Infrastructure',
      job_type: 'contract',
      workplace_type: 'remote',
      salary_range: '$85,000 - $115,000',
      location: 'Remote',
      company: 'BlockOps Pro',
      experience: 'Mid-level',
      stage: 'Open',
      disability_friendly: true,
      inclusive_hiring_statement: 'Equal opportunity employer with focus on accessibility.',
      accessibility_level: 'High',
      accommodations: [{ description: 'Remote work' }, { description: 'Flexible hours' }, { description: 'Assistive technology' }],
      qualification: '- 4+ years of DevOps engineering experience\\n- Experience with Kubernetes and Docker containerization\\n- Knowledge of AWS/GCP cloud infrastructure\\n- Blockchain node management experience\\n- Proficiency in CI/CD pipelines and Infrastructure as Code',
      created_at: '2024-01-03',
      updated_at: '2024-01-03',
    },
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
