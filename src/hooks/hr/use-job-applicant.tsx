import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios';

import { API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';
import { JobApplicant, JobPostingDataExtended } from '@/types/response/job';

export interface JobApplicantWithJobDetails extends JobApplicant {
  jobDetails?: JobPostingDataExtended;
}

export const useJobApplicants = (
  userEmail: string | undefined,
  options = { noCache: false }
) => {
  return useQuery<JobApplicantWithJobDetails[], Error>({
    queryKey: ['new-applicants', userEmail],
    queryFn: async () => {
      if (!userEmail) {
        throw new Error('User email is required');
      }

      // 1. Fetch all job applications
      const applicantsResponse = await api.get<ApiReturn<JobApplicant[]>>(
        `${API_BASE_URL}/job-aplications/applied/${userEmail}`
      );

      const applicants = applicantsResponse.data.data;

      if (applicants === null) {
        return [];
      }

      // 2. Extract unique job vacancy IDs
      const jobVacancyIds = Array.from(
        new Set(applicants.map((app) => app.job_vacancy_id))
      );

      // 3. Create a map to store job details by ID
      const jobDetailsMap: Record<string, JobPostingDataExtended> = {};

      // 4. Fetch job details for each unique job vacancy ID
      await Promise.all(
        jobVacancyIds.map(async (jobId) => {
          try {
            const jobResponse = await api.get<
              ApiReturn<JobPostingDataExtended>
            >(`${API_BASE_URL}/job-vacancies/details/${jobId}`);

            jobDetailsMap[jobId] = jobResponse.data.data;
          } catch (error) {
            console.error(
              `Failed to fetch job details for job ID ${jobId}:`,
              error
            );
            // Create an empty job details object if fetch fails
            jobDetailsMap[jobId] = {
              id: jobId,
              division: '-',
              department: '-',
              location: '-',
              additional_image_url: '-',
              email: '-',
              end_date: '-',
              job_type: 'casual',
              qualification: '-',
              responsibilities: '',
              start_date: '-',
              workplace_type: 'on_site',
              // title: 'Unknown Job',
              // description: 'Job details not available',
              // requirements: [],
            };
          }
        })
      );

      // 5. Combine applicant data with job details
      const applicantsWithJobDetails = applicants.map((applicant) => ({
        ...applicant,
        jobDetails: jobDetailsMap[applicant.job_vacancy_id],
      }));

      // console.log(applicantsWithJobDetails);

      return applicantsWithJobDetails;
    },
    enabled: !!userEmail,
    ...(options.noCache
      ? {
          cacheTime: 0,
          staleTime: 0,
          refetchOnMount: true,
          refetchOnWindowFocus: true,
        }
      : {}),
  });
};
