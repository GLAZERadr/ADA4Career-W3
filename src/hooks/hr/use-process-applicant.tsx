import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import api from '@/lib/axios';

import { client } from '@/components/layout/query-provider';

import { API_BASE_URL } from '@/constant/config';

import { ApiError } from '@/types/api.types';

interface ApplicantStatusParams {
  applicantId: string;
}

export function useApplicantStatus() {
  // Accept Applicant Mutation
  const {
    mutateAsync: acceptApplicant,
    isPending: isAccepting,
    isError: isAcceptError,
    error: acceptError,
  } = useMutation<null, ApiError, ApplicantStatusParams>({
    mutationFn: async ({ applicantId }) => {
      await api.post(`${API_BASE_URL}/job-application/accepted/${applicantId}`);
      return null;
    },
    onSuccess: () => {
      toast.success('Applicant accepted successfully!');
      // Invalidate relevant queries to refetch updated data
      client.invalidateQueries({ queryKey: ['process-applicants'] });
    },
    onError: (error) => {
      toast.error(`Error accepting applicant: ${error.message}`);
    },
  });

  // Reject Applicant Mutation
  const {
    mutateAsync: rejectApplicant,
    isPending: isRejecting,
    isError: isRejectError,
    error: rejectError,
  } = useMutation<null, ApiError, ApplicantStatusParams>({
    mutationFn: async ({ applicantId }) => {
      await api.post(`${API_BASE_URL}/job-application/rejected/${applicantId}`);
      return null;
    },
    onSuccess: () => {
      toast.success('Applicant rejected successfully!');
      // Invalidate relevant queries to refetch updated data
      client.invalidateQueries({ queryKey: ['process-applicants'] });
    },
    onError: (error) => {
      toast.error(`Error rejecting applicant: ${error.message}`);
    },
  });

  return {
    acceptApplicant,
    isAccepting,
    isAcceptError,
    acceptError,
    rejectApplicant,
    isRejecting,
    isRejectError,
    rejectError,
    isProcessing: isAccepting || isRejecting,
  };
}
