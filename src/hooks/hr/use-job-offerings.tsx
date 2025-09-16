import { useQuery } from '@tanstack/react-query';

import api from '@/lib/axios';

import { API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';
import {
  JobApplicant,
  JobPostingDataExtended,
  JobPostingWithApplicants,
} from '@/types/response/job';

export const useJobOfferings = (userEmail: string | undefined) => {
  return useQuery<
    {
      ongoingJobs: JobPostingWithApplicants[];
      completedJobs: JobPostingWithApplicants[];
      allJobs: JobPostingWithApplicants[];
    },
    Error
  >({
    queryKey: ['offerings', userEmail],
    queryFn: async () => {
      if (!userEmail) {
        throw new Error('User email is required');
      }

      // Fetch job offerings
      const response = await api.get<ApiReturn<JobPostingDataExtended[]>>(
        `${API_BASE_URL}/job-vacancies/${userEmail}`
      );

      // console.log('pokenatt');

      const offerings = response.data.data;

      // Fetch applicants for each job offering
      const offeringsWithApplicants = await Promise.all(
        offerings.map(async (offering) => {
          try {
            const applicantsResponse = await api.get<ApiReturn<JobApplicant[]>>(
              `${API_BASE_URL}/job-applications/job-vacancy/${offering.id}`
            );

            const allApplicants = applicantsResponse.data.data;
            // Filter out accepted applicants
            const acceptedApplicants = allApplicants.filter(
              (applicant) => applicant.status === 'accepted'
            );
            const appliedApplicant = allApplicants.filter(
              (applicant) => applicant.status === 'applied'
            );
            const rejectedApplicants = allApplicants.filter(
              (applicant) => applicant.status === 'rejected'
            );

            return {
              ...offering,
              applicants: allApplicants,
              acceptedApplicant: acceptedApplicants,
              rejectedApplicant: rejectedApplicants,
              appliedApplicant: appliedApplicant,
            };
          } catch (error) {
            console.error(
              `Failed to fetch applicants for job ${offering.id}:`,
              error
            );
            return {
              ...offering,
              applicants: [],
              acceptedApplicant: [],
              rejectedApplicant: [],
              appliedApplicant: [],
            };
          }
        })
      );

      console.log(offeringsWithApplicants);

      // Separate jobs into ongoing and completed categories
      const ongoingJobs = offeringsWithApplicants.filter(
        (job) => job.acceptedApplicant?.length === 0
      );

      const completedJobs = offeringsWithApplicants.filter(
        (job) => job.acceptedApplicant && job.acceptedApplicant.length > 0
      );

      // console.log(offeringsWithApplicants);
      return {
        ongoingJobs,
        completedJobs,
        allJobs: offeringsWithApplicants,
      };
    },
  });
};
