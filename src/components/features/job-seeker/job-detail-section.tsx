'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Accessibility,
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  Clock,
  DollarSign,
  Globe,
  Heart,
  Mail,
  MapPin,
  Share2,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl'; // Import useTranslations
import React from 'react';
import { toast } from 'react-toastify';

import api from '@/lib/axios';
import { formatDate } from '@/lib/utils';

import { CircularProgressIndicator } from '@/components/features/job-seeker/circular-progress';
import JobApplicationModal from '@/components/features/job-seeker/job-application-modal';
import { SegmentedProgressBar } from '@/components/segmented-progress-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import useAuthStore from '@/store/useAuthStore';

import { API_BASE_URL } from '@/constant/config';

import { ApiError, ApiReturn } from '@/types/api.types';
import { JobPostingDataExtended } from '@/types/response/job';

const formatReasoning = (text: string) => {
  if (!text) return '';
  return text
    .replace(/^Semantic analysis of skill relevance:\n-/g, '')
    .replace(/^- /gm, '')
    .trim();
};

export default function JobDetailSection({ id }: { id: string }) {
  // Add translation hooks for different sections
  const t = useTranslations('JobDetail');
  const tJobTypes = useTranslations('Jobs.Card.jobTypes');
  const tWorkplaceTypes = useTranslations('Jobs.Card.workplaceTypes');
  const tAccessibilityLevels = useTranslations('Jobs.Card.accessibilityLevels');

  // Use translations for job type labels
  const jobTypeLabels = {
    full_time: tJobTypes('full_time'),
    part_time: tJobTypes('part_time'),
    contract: tJobTypes('contract'),
    fixed_term: tJobTypes('fixed_term'),
    casual: tJobTypes('casual'),
  };

  // Use translations for workplace type labels
  const workplaceTypeLabels = {
    remote: tWorkplaceTypes('remote'),
    hybrid: tWorkplaceTypes('hybrid'),
    on_site: tWorkplaceTypes('on_site'),
  };

  // Use translations for accessibility level labels
  const accessibilityLevelLabels = {
    high: tAccessibilityLevels('high'),
    medium: tAccessibilityLevels('medium'),
    standard: tAccessibilityLevels('standard'),
  };

  const formatBulletPoints = (text: string) => {
    if (!text) return [];
    return text
      .split('\\n')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const { user } = useAuthStore();

  // Dummy job data for demo purposes (same as jobs listing page)
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
      // Add demo scoring data
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

  const { data, isPending } = useQuery<JobPostingDataExtended>({
    queryKey: ['detail-job', id],
    queryFn: async () => {
      // Always use dummy data for demo purposes
      console.log('Using dummy job detail data for demo, job ID:', id);
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Find the job by ID, default to first job if not found
      const job = dummyJobs.find(job => job.id === id) || dummyJobs[0];
      return job;
    },
    retry: false, // Don't retry on error
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
  const [open, setOpen] = React.useState(false);

  const { mutateAsync: applyWithUrl, isPending: isPendingUrl } = useMutation<
    void,
    ApiError,
    {
      cover_letter: string;
      url: string;
      defaultForm: FormData;
    }
  >({
    mutationFn: async (data) => {
      data.defaultForm.append('resume_url', data.url);
      const response = await api.post(
        `${API_BASE_URL}/job-application`,
        data.defaultForm,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return;
    },
    onSuccess: () => {
      toast.success('Success Applied');
    },
  });

  const { mutateAsync: applyWithFile, isPending: isPendingFile } = useMutation<
    void,
    ApiError,
    {
      cover_letter: string;
      file: File;
      defaultForm: FormData;
    }
  >({
    mutationFn: async (data) => {
      data.defaultForm.append('file', data.file);
      const response = await api.post(
        `${API_BASE_URL}/job-application`,
        data.defaultForm,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return;
    },
    onSuccess: () => {
      toast.success('Success Applied');
    },
  });

  const handleSubmit = (dataLoc: {
    resume: File | string | null;
    coverLetter: string;
    usingDefault: boolean;
  }) => {
    const defaultForm = new FormData();
    defaultForm.append('job_vacancy_id', id);
    defaultForm.append('job_seeker_email', user?.email ?? '');
    defaultForm.append('cover_letter', dataLoc.coverLetter);
    defaultForm.append(
      'match_percentage',
      String(data?.match_percentage ?? '0')
    );
    defaultForm.append(
      'skills_score',
      String(data?.score_breakdown?.skills_score ?? '0')
    );
    defaultForm.append(
      'experience_score',
      String(data?.score_breakdown?.experience_score ?? '0')
    );
    defaultForm.append(
      'expectations_score',
      String(data?.score_breakdown?.expectations_score ?? '0')
    );
    defaultForm.append(
      'accessibility_score',
      String(data?.score_breakdown?.accessibility_score ?? '0')
    );
    defaultForm.append(
      'skills_reasoning',
      String(data?.score_breakdown?.skills_reasoning ?? '')
    );
    defaultForm.append(
      'experience_reasoning',
      String(data?.score_breakdown?.experience_reasoning ?? '')
    );
    defaultForm.append(
      'expectations_reasoning',
      String(data?.score_breakdown?.expectations_reasoning ?? '')
    );
    defaultForm.append(
      'accessibility_reasoning',
      String(data?.score_breakdown?.accessibility_reasoning ?? '')
    );

    if (dataLoc.usingDefault) {
      applyWithUrl({
        defaultForm,
        cover_letter: dataLoc.coverLetter,
        url: dataLoc.resume as string,
      });
    } else {
      applyWithFile({
        defaultForm,
        cover_letter: dataLoc.coverLetter,
        file: dataLoc.resume as File,
      });
    }
  };
  const responsibilities = formatBulletPoints(data?.responsibilities ?? '');
  const qualifications = formatBulletPoints(data?.qualification ?? '');

  // Generate random match percentage between 65% and 95%
  // const matchPercentage =
  //   data?.match_percentage || Math.floor(Math.random() * 31) + 65;

  // Generate random salary range based on job type
  const generateSalaryRange = () => {
    const baseSalary = {
      full_time: [80000, 120000],
      part_time: [30000, 60000],
      contract: [90000, 150000],
      fixed_term: [70000, 110000],
      casual: [25000, 50000],
    };

    const range = baseSalary[data?.job_type as keyof typeof baseSalary];
    const min = range[0];
    const max = range[1];

    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  // Generate random benefits
  const benefits = [
    'Health insurance',
    'Dental and vision coverage',
    '401(k) matching',
    'Flexible work hours',
    'Remote work options',
    'Professional development budget',
    'Paid time off',
    'Parental leave',
    'Wellness programs',
    'Company events and retreats',
  ];

  // Select 4-6 random benefits
  const selectedBenefits = () => {
    const shuffled = [...benefits].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 3) + 4);
  };

  const jobBenefits = selectedBenefits();

  if (isPending) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <>
      <JobApplicationModal
        onOpenChange={setOpen}
        loading={isPendingFile || isPendingUrl}
        defaultResume={user?.job_seeker_data?.resume_url ?? ''}
        open={open}
        onSubmit={handleSubmit}
      />
      <div className='container mx-auto px-4 py-8'>
        {/* Back button */}
        <Link href='/app/home/jobs' className='inline-flex items-center  mb-6'>
          <Button>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('navigation.backToJobs')}
          </Button>
        </Link>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main content */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg shadow-md overflow-hidden'>
              {/* Header */}
              <div className='p-6 border-b'>
                <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
                  <div className='flex items-start gap-4'>
                    <div className='w-16 h-16 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0'>
                      <span className='text-amber-600 font-semibold text-2xl'>
                        {data?.division.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h1 className='text-2xl font-bold'>{data?.division}</h1>
                      <p className='text-gray-600 mt-1'>
                        {data?.company || 'TechCorp'} /{' '}
                        {data?.department || data?.division} -{' '}
                        {data?.stage || 'Growing'}
                      </p>
                      <div className='flex flex-wrap gap-2 mt-3'>
                        <Badge variant='secondary' className='font-normal'>
                          {
                            jobTypeLabels[
                              data?.job_type as keyof typeof jobTypeLabels
                            ]
                          }
                        </Badge>
                        <Badge variant='outline' className='font-normal'>
                          {
                            workplaceTypeLabels[
                              data?.workplace_type as keyof typeof workplaceTypeLabels
                            ]
                          }
                        </Badge>
                        <Badge
                          variant='outline'
                          className='font-normal text-blue-500 border-blue-200 bg-blue-50'
                        >
                          {t('badges.new')}
                        </Badge>
                        {data?.disability_friendly && (
                          <Badge
                            variant='outline'
                            className='font-normal text-green-600 border-green-200 bg-green-50'
                          >
                            <Accessibility className='h-3.5 w-3.5 mr-1' />
                            {t('badges.disabilityFriendly')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='flex gap-2 mt-4 md:mt-0'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='rounded-full'
                    >
                      <Heart className='h-5 w-5' />
                      <span className='sr-only'>Save job</span>
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      className='rounded-full'
                    >
                      <Share2 className='h-5 w-5' />
                      <span className='sr-only'>Share job</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Job details tabs */}
              <Tabs defaultValue='details' className='p-6'>
                <TabsList className='mb-6'>
                  <TabsTrigger value='details'>
                    {t('tabs.jobDetails')}
                  </TabsTrigger>
                  <TabsTrigger value='accessibility'>
                    {t('tabs.accessibility')}
                  </TabsTrigger>
                  <TabsTrigger value='company'>{t('tabs.company')}</TabsTrigger>
                  <TabsTrigger value='breakdown'>
                    {t('tabs.breakdown')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='details' className='space-y-8'>
                  {/* Key details */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='flex items-start gap-3'>
                      <MapPin className='h-5 w-5 text-gray-500 mt-0.5' />
                      <div>
                        <h3 className='font-medium'>{t('jobInfo.location')}</h3>
                        <p className='text-gray-600'>
                          {data?.location ||
                            workplaceTypeLabels[
                              data?.workplace_type ?? 'remote'
                            ]}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <Clock className='h-5 w-5 text-gray-500 mt-0.5' />
                      <div>
                        <h3 className='font-medium'>{t('jobInfo.jobType')}</h3>
                        <p className='text-gray-600'>
                          {jobTypeLabels[data?.job_type ?? 'casual']}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <DollarSign className='h-5 w-5 text-gray-500 mt-0.5' />
                      <div>
                        <h3 className='font-medium'>
                          {t('jobInfo.salaryRange')}
                        </h3>
                        <p className='text-gray-600'>
                          {generateSalaryRange()} {t('jobInfo.perYear')}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <Calendar className='h-5 w-5 text-gray-500 mt-0.5' />
                      <div>
                        <h3 className='font-medium'>{t('jobInfo.duration')}</h3>
                        <p className='text-gray-600'>
                          {formatDate(data?.start_date ?? '')} -{' '}
                          {formatDate(data?.end_date ?? '')}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <Briefcase className='h-5 w-5 text-gray-500 mt-0.5' />
                      <div>
                        <h3 className='font-medium'>
                          {t('jobInfo.experience')}
                        </h3>
                        <p className='text-gray-600'>
                          {data?.experience || t('jobInfo.required')}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <Mail className='h-5 w-5 text-gray-500 mt-0.5' />
                      <div>
                        <h3 className='font-medium'>{t('jobInfo.contact')}</h3>
                        <p className='text-gray-600'>{data?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Job description */}
                  <div>
                    <h2 className='text-xl font-semibold mb-4'>
                      {t('content.jobDescription')}
                    </h2>
                    <p className='text-gray-700 mb-6'>
                      {t('content.lookingFor', {
                        division: data?.division ?? '',
                      })}
                    </p>

                    {responsibilities.length > 0 && (
                      <div className='mb-6'>
                        <h3 className='text-lg font-semibold mb-3'>
                          {t('content.responsibilities')}
                        </h3>
                        <ul className='list-disc pl-5 space-y-2'>
                          {responsibilities.map((item, index) => (
                            <li key={index} className='text-gray-700'>
                              {item.replace(/^- /, '')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {qualifications.length > 0 && (
                      <div className='mb-6'>
                        <h3 className='text-lg font-semibold mb-3'>
                          {t('content.qualifications')}
                        </h3>
                        <ul className='list-disc pl-5 space-y-2'>
                          {qualifications.map((item, index) => (
                            <li key={index} className='text-gray-700'>
                              {item.replace(/^- /, '')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Benefits */}
                  <div>
                    <h2 className='text-xl font-semibold mb-4'>
                      {t('content.benefits')}
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {jobBenefits.map((benefit, index) => (
                        <div key={index} className='flex items-center gap-2'>
                          <CheckCircle2 className='h-5 w-5 text-green-500' />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Accessibility Tab */}
                <TabsContent value='accessibility' className='space-y-6'>
                  <div>
                    <div className='flex items-center gap-2 mb-4'>
                      <Accessibility className='h-6 w-6 text-green-600' />
                      <h2 className='text-xl font-semibold'>
                        {t('accessibility.title')}
                      </h2>
                    </div>

                    <div className='mb-6'>
                      <h3 className='text-lg font-medium mb-2'>
                        {t('accessibility.accessibilityLevel')}
                      </h3>
                      <Badge className='text-base font-normal py-1 px-3 bg-green-100 text-green-800 hover:bg-green-200'>
                        {data?.accessibility_level
                          ? accessibilityLevelLabels[data?.accessibility_level]
                          : t('badges.disabilityFriendly')}
                      </Badge>
                      <p className='mt-3 text-gray-700'>
                        {t('accessibility.ratedAs', {
                          level: data?.accessibility_level
                            ? accessibilityLevelLabels[
                                data?.accessibility_level
                              ].toLowerCase()
                            : 'standard',
                        })}
                      </p>
                    </div>
                    {data?.accommodations &&
                      data?.accommodations.length > 0 && (
                        <div className='mb-6'>
                          <h3 className='text-lg font-medium mb-2'>
                            {t('accessibility.availableAccommodations')}
                          </h3>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {data?.accommodations.map(
                              (accommodation, index) => (
                                <div
                                  key={index}
                                  className='flex items-start gap-2 bg-gray-50 p-3 rounded-md'
                                >
                                  <CheckCircle2 className='h-5 w-5 text-green-500 mt-0.5' />
                                  <div>
                                    <p className='font-medium'>
                                      {accommodation.type}
                                    </p>
                                    <p className='text-gray-600'>
                                      {accommodation.description}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    <div className='mb-6'>
                      <h3 className='text-lg font-medium mb-2'>
                        {t('accessibility.inclusiveHiringStatement')}
                      </h3>
                      <div className='bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md'>
                        <p className='text-gray-700'>
                          {data?.inclusive_hiring_statement ||
                            t('accessibility.defaultStatement')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className='text-lg font-medium mb-2'>
                        {t('accessibility.additionalSupport')}
                      </h3>
                      <p className='text-gray-700 mb-3'>
                        {t('accessibility.contactForAccommodations', {
                          email: data?.email ?? '',
                        })}
                      </p>
                      <p className='text-gray-700'>
                        {t('accessibility.welcomeSuggestions')}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='company'>
                  <div className='space-y-6'>
                    <div className='flex items-center gap-4'>
                      <div className='w-16 h-16 rounded-md bg-amber-50 flex items-center justify-center'>
                        <span className='text-amber-600 font-semibold text-2xl'>
                          {(data?.company || 'TC').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className='text-xl font-semibold'>
                          {data?.company || 'TechCorp'}
                        </h2>
                        <p className='text-gray-600'>
                          {t('company.growingCompany', {
                            stage: data?.stage || 'Growing',
                          })}
                        </p>
                      </div>
                    </div>

                    <p className='text-gray-700'>
                      {t('company.description', {
                        company: data?.company || 'TechCorp',
                        stage: data?.stage?.toLowerCase() || 'growing',
                        industry:
                          (data?.department ?? '') || (data?.division ?? ''),
                      })}
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
                      <div className='flex items-start gap-3'>
                        <Users className='h-5 w-5 text-gray-500 mt-0.5' />
                        <div>
                          <h3 className='font-medium'>
                            {t('company.companySize')}
                          </h3>
                          <p className='text-gray-600'>
                            {t('company.employees', {
                              min: Math.floor(Math.random() * 900) + 100,
                              max: Math.floor(Math.random() * 900) + 1000,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start gap-3'>
                        <Globe className='h-5 w-5 text-gray-500 mt-0.5' />
                        <div>
                          <h3 className='font-medium'>
                            {t('company.website')}
                          </h3>
                          <p className='text-gray-600'>
                            www.
                            {(data?.company || 'techcorp')
                              .toLowerCase()
                              .replace(/\s+/g, '')}
                            .com
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start gap-3'>
                        <Building className='h-5 w-5 text-gray-500 mt-0.5' />
                        <div>
                          <h3 className='font-medium'>
                            {t('company.industry')}
                          </h3>
                          <p className='text-gray-600'>
                            {data?.department || data?.division}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='mt-6'>
                      <h3 className='font-medium mb-2'>
                        {t('company.commitmentToAccessibility')}
                      </h3>
                      <p className='text-gray-700'>
                        {t('company.accessibilityStatement', {
                          company: data?.company || 'TechCorp',
                        })}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value='breakdown'>
                  <div className='mt-2'>
                    <h3 className='font-semibold text-lg mb-3'>Skills Match</h3>
                    <div className='flex flex-wrap gap-2 mb-4'>
                      {data?.matching_skills?.map((skill, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='bg-green-50 text-green-700 border-green-200 flex items-center gap-1'
                        >
                          <Check className='h-3 w-3' /> {skill}
                        </Badge>
                      ))}
                    </div>

                    {data?.missing_skills &&
                      data.missing_skills[0] !== 'None' && (
                        <>
                          <h3 className='font-medium text-lg mb-3 mt-4'>
                            Missing Skills
                          </h3>
                          <div className='flex flex-wrap gap-2'>
                            {data?.missing_skills?.map((skill, index) => (
                              <Badge
                                key={index}
                                variant='outline'
                                className='bg-red-50 text-red-700 border-red-200 flex items-center gap-1'
                              >
                                <X className='h-3 w-3' /> {skill}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                  </div>

                  <div className='mt-6'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-xl font-semibold'>
                          Score Breakdown
                        </CardTitle>
                        <CardDescription>
                          Detailed analysis of your match scores
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        {/* Skills Score */}
                        <Collapsible
                          // onOpenChange={() => toggleSection('skills')}
                          className='border rounded-lg overflow-hidden'
                        >
                          <CollapsibleTrigger className='flex justify-between items-center w-full p-4 text-left'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>Skills Match</span>
                              <Badge
                                variant='outline'
                                className='ml-2 bg-gray-100'
                              >
                                {data?.score_breakdown?.skills_score}/40
                              </Badge>
                            </div>
                            <ChevronsUpDown className='h-5 w-5 text-gray-500' />
                            {/* {true ? (
                              <ChevronUp className='h-5 w-5 text-gray-500' />
                            ) : (
                              <ChevronDown className='h-5 w-5 text-gray-500' />
                            )} */}
                          </CollapsibleTrigger>
                          <CollapsibleContent className='px-4 pb-4 border-t pt-3'>
                            <p className='text-gray-700 whitespace-pre-line'>
                              {formatReasoning(
                                data?.score_breakdown?.skills_reasoning ?? ''
                              )}
                            </p>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Experience Score */}
                        <Collapsible className='border rounded-lg overflow-hidden'>
                          <CollapsibleTrigger className='flex justify-between items-center w-full p-4 text-left'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>
                                Experience Match
                              </span>
                              <Badge
                                variant='outline'
                                className='ml-2 bg-gray-100'
                              >
                                {data?.score_breakdown?.experience_score}/30
                              </Badge>
                            </div>
                            <ChevronsUpDown className='h-5 w-5 text-gray-500' />
                          </CollapsibleTrigger>
                          <CollapsibleContent className='px-4 pb-4 border-t pt-3'>
                            <p className='text-gray-700'>
                              {data?.score_breakdown?.experience_reasoning}
                            </p>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Expectations Score */}
                        <Collapsible className='border rounded-lg overflow-hidden'>
                          <CollapsibleTrigger className='flex justify-between items-center w-full p-4 text-left'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>
                                Expectations Match
                              </span>
                              <Badge
                                variant='outline'
                                className='ml-2 bg-gray-100'
                              >
                                {data?.score_breakdown?.expectations_score}/20
                              </Badge>
                            </div>
                            <ChevronsUpDown className='h-5 w-5 text-gray-500' />
                          </CollapsibleTrigger>
                          <CollapsibleContent className='px-4 pb-4 border-t pt-3'>
                            <p className='text-gray-700'>
                              {data?.score_breakdown?.expectations_reasoning}
                            </p>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Accessibility Score */}
                        <Collapsible className='border rounded-lg overflow-hidden'>
                          <CollapsibleTrigger className='flex justify-between items-center w-full p-4 text-left'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>
                                Accessibility Match
                              </span>
                              <Badge
                                variant='outline'
                                className='ml-2 bg-gray-100'
                              >
                                {data?.score_breakdown?.accessibility_score}/10
                              </Badge>
                            </div>
                            <ChevronsUpDown className='h-5 w-5 text-gray-500' />
                          </CollapsibleTrigger>
                          <CollapsibleContent className='px-4 pb-4 border-t pt-3'>
                            <p className='text-gray-700'>
                              {data?.score_breakdown?.accessibility_reasoning}
                            </p>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Match score */}
            <Card className='bg-gray-900 text-white overflow-hidden'>
              <CardContent className='p-6'>
                <div className='flex flex-col items-center mb-6'>
                  <CircularProgressIndicator
                    percentage={data?.match_percentage ?? 0}
                    size={120}
                    strokeWidth={12}
                  />
                </div>

                <h3 className='font-medium mb-3'>{t('jobInfo.required')}</h3>
                <ul className='space-y-2 mb-6'>
                  {qualifications.slice(0, 3).map((qualification, index) => (
                    <li key={index} className='flex items-start gap-2 text-sm'>
                      <span className='text-white mt-1'>•</span>
                      <span>{qualification.replace(/^- /, '')}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className='bg-gray-900 text-white'>
              <CardContent className='p-6'>
                <h4 className='mb-2'>Score Breakdown</h4>
                <SegmentedProgressBar
                  scoreBreakdown={data?.score_breakdown}
                  height={12}
                />
              </CardContent>
            </Card>

            {/* Apply now */}
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>
                  {t('sidebar.applyPosition')}
                </h3>
                <p className='text-gray-600 mb-6'>
                  {t('sidebar.applicationInfo')}
                </p>
                <Button
                  onClick={() => {
                    setOpen(true);
                  }}
                  className='w-full bg-blue-500 hover:bg-blue-600'
                >
                  {t('sidebar.applyNow')}
                </Button>
                <p className='text-sm text-gray-500 mt-3'>
                  {t('sidebar.accommodationNote', { email: data?.email ?? '' })}
                </p>
              </CardContent>
            </Card>

            {/* Accessibility highlights */}
            <Card className='border-green-200'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <Accessibility className='h-5 w-5 text-green-600' />
                  <h3 className='text-lg font-semibold'>
                    {t('sidebar.accessibilityHighlights')}
                  </h3>
                </div>

                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>
                      {t('accessibility.accessibilityLevel')}
                    </span>
                    <Badge className='font-normal bg-green-100 text-green-800 hover:bg-green-200'>
                      {data?.accessibility_level
                        ? accessibilityLevelLabels[data?.accessibility_level]
                        : 'Standard'}
                    </Badge>
                  </div>

                  <div className='pt-2'>
                    <p className='text-gray-600 font-medium mb-2'>
                      {t('sidebar.keyAccommodations')}
                    </p>
                    <ul className='space-y-1'>
                      {(data?.accommodations || [])
                        .slice(0, 3)
                        .map((accommodation, index) => (
                          <li
                            key={index}
                            className='flex items-start gap-2 text-sm'
                          >
                            <CheckCircle2 className='h-4 w-4 text-green-500 mt-0.5' />
                            <span className='text-gray-700'>
                              {accommodation.description}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className='mt-4 pt-4 border-t border-gray-100'>
                  <Link
                    href='#'
                    className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                  >
                    {t('sidebar.viewAll')}
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Job insights */}
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>
                  {t('sidebar.jobInsights')}
                </h3>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>{t('sidebar.posted')}</span>
                    <span className='font-medium'>
                      {t('sidebar.daysAgo', {
                        days: Math.floor(Math.random() * 7) + 1,
                      })}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>
                      {t('sidebar.applications')}
                    </span>
                    <span className='font-medium'>
                      {Math.floor(Math.random() * 50) + 5}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>
                      {t('sidebar.interviews')}
                    </span>
                    <span className='font-medium'>
                      {Math.floor(Math.random() * 10) + 1}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
