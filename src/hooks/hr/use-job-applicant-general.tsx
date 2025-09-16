import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios';

import { API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';
import {
  ApplicantWithJobDetails,
  JobApplicant,
  JobPostingDataExtended,
} from '@/types/response/job';

type ApplicationStatus = 'applied' | 'reviewing' | 'rejected' | 'accepted';

/**
 * Interface for options passed to the useAcceptedApplicants hook
 */
interface ApplicantFetchOptions {
  /** Whether to disable caching */
  noCache?: boolean;
  /** The status of applications to fetch */
  status?: ApplicationStatus;
  /** Whether to include job details in the response */
  includeJobDetails?: boolean;
}

/**
 * Interface for the response from the useAcceptedApplicants hook
 */
interface ApplicantHookResponse {
  /** Array of applicants with their job details */
  applicants?: ApplicantWithJobDetails[];
  /** Map of job vacancy IDs to job details */
  jobVacancyDetails: Record<string, JobPostingDataExtended>;
  /** Whether data is currently being loaded */
  isLoading: boolean;
  /** Whether an error occurred during loading */
  isError: boolean;
  /** The error that occurred, if any */
  error: Error | null;
  /** Function to refetch the data */
  refetch: () => void;
}

/**
 * Custom hook to fetch applicants and their job details in a sequential flow
 * @param userEmail The HR manager's email
 * @param options Query options including cache settings and status filter
 * @returns Applicants with their job details and loading/error states
 */
export const useApplicants = (
  userEmail: string | undefined,
  options: ApplicantFetchOptions = {
    noCache: false,
    status: 'accepted',
    includeJobDetails: true,
  }
): ApplicantHookResponse => {
  // Sequential fetching: first applicants, then job details in a single query
  const result = useQuery<
    {
      applicants: ApplicantWithJobDetails[];
      jobVacancyDetails: Record<string, JobPostingDataExtended>;
    },
    Error
  >({
    queryKey: [`all-applicants-with-details`],
    queryFn: async () => {
      if (!userEmail) {
        throw new Error('User email is required');
      }

      // Step 1: Fetch all applicants for the HR email with specified status
      const endpoint = options.status
        ? `${API_BASE_URL}/job-aplications/${options.status}/${userEmail}`
        : `${API_BASE_URL}/job-aplications/all/${userEmail}`;

      const applicantsResponse = await api.get<ApiReturn<JobApplicant[]>>(
        endpoint
      );

      const applicants = applicantsResponse.data.data;

      // Step 2: If includeJobDetails is false, return applicants without job details
      if (!options.includeJobDetails) {
        return {
          applicants: applicants.map((app) => ({ ...app })),
          jobVacancyDetails: {},
        };
      }

      // Step 3: Get unique job vacancy IDs to fetch details
      const uniqueJobVacancyIds = Array.from(
        new Set(applicants.map((app) => app.job_vacancy_id))
      );

      // Step 4: Fetch details for each unique job vacancy
      const jobVacancyDetails: Record<string, JobPostingDataExtended> = {};

      await Promise.all(
        uniqueJobVacancyIds.map(async (jobId) => {
          try {
            const response = await api.get<ApiReturn<JobPostingDataExtended>>(
              `${API_BASE_URL}/job-vacancy/${jobId}`
            );
            jobVacancyDetails[jobId] = response.data.data;
          } catch (error) {
            console.error(
              `Failed to fetch details for job ID: ${jobId}`,
              error
            );
            // Create a minimal placeholder for failed fetches
            jobVacancyDetails[jobId] = {
              id: jobId,
              division: 'Unknown Position',
              email: '',
              job_type: 'full_time',
              workplace_type: 'on_site',
              start_date: '',
              end_date: '',
              responsibilities: '',
              qualification: '',
              additional_image_url: '',
              company: 'Unknown Company',
              department: 'Unknown Department',
            };
          }
        })
      );

      // Step 5: Combine applicants with job details
      const applicantsWithJobDetails = applicants.map((applicant) => ({
        ...applicant,
        jobDetails: jobVacancyDetails[applicant.job_vacancy_id],
      }));

      return {
        applicants: applicantsWithJobDetails,
        jobVacancyDetails,
      };
    },
    ...(options.noCache
      ? {
          gcTime: 0,
          staleTime: 0,
          refetchOnMount: true,
          refetchOnWindowFocus: true,
        }
      : {
          gcTime: 5 * 60 * 1000, // 5 minutes
          staleTime: 60 * 1000, // 1 minute
          refetchOnMount: false,
          refetchOnWindowFocus: false,
        }),
    enabled: !!userEmail,
    // ...(options.noCache
    //   ? {
    //       // cacheTime: 0,
    //       // staleTime: 0,
    //       // refetchOnMount: true,
    //       // refetchOnWindowFocus: true,
    //     }
    //   : {}),
  });

  return {
    applicants: result.data?.applicants,
    jobVacancyDetails: result.data?.jobVacancyDetails || {},
    isLoading: result.isPending,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Helper hook to fetch accepted applicants
 * Just a convenience wrapper around useApplicants
 */
export const useAcceptedApplicants = (
  userEmail: string | undefined,
  options: Omit<ApplicantFetchOptions, 'status'> = {}
): ApplicantHookResponse => {
  return useApplicants(userEmail, { ...options, status: 'accepted' });
};

/**
 * Helper hook to fetch rejected applicants
 * Just a convenience wrapper around useApplicants
 */
export const useRejectedApplicants = (
  userEmail: string | undefined,
  options: Omit<ApplicantFetchOptions, 'status'> = {}
): ApplicantHookResponse => {
  return useApplicants(userEmail, { ...options, status: 'rejected' });
};

/**
 * Helper hook to fetch applied applicants
 * Just a convenience wrapper around useApplicants
 */
export const useAppliedApplicants = (
  userEmail: string | undefined,
  options: Omit<ApplicantFetchOptions, 'status'> = {}
): ApplicantHookResponse => {
  return useApplicants(userEmail, { ...options, status: 'applied' });
};

/**
 * Helper hook to fetch reviewing applicants
 * Just a convenience wrapper around useApplicants
 */
export const useReviewingApplicants = (
  userEmail: string | undefined,
  options: Omit<ApplicantFetchOptions, 'status'> = {}
): ApplicantHookResponse => {
  return useApplicants(userEmail, { ...options, status: 'reviewing' });
};
