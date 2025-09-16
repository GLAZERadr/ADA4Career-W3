// import { formatDate } from '@/lib/utils';

import { JobApplicantWithJobDetails } from '@/hooks/hr/use-job-applicant';

import { Applicant } from '@/components/features/human-resources/applicant-table/schema';

/**
 * Adapts the JobApplicantWithJobDetails data from the API to match the Applicant schema
 * required by the DataTable component
 */
export const adaptToApplicantSchema = (
  applicants: JobApplicantWithJobDetails[] | undefined
): Applicant[] => {
  if (!applicants) return [];

  return applicants.map((applicant) => {
    // Generate name from email for display
    const emailParts = applicant.job_seeker_email.split('@')[0].split('.');
    const name = emailParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    // Format dates
    const appliedDate = new Date(applicant.applied_date);

    // Create end date (3 months from applied date as placeholder)
    const endDate = new Date(applicant.applied_date);
    endDate.setMonth(endDate.getMonth() + 3);

    return {
      id: applicant.id,
      name: name,
      avatar: '', // No avatar provided in API
      position: applicant.jobDetails?.division || 'Unknown Position',
      startDate: formatDate(appliedDate),
      endDate: formatDate(endDate),
      cvLink: applicant.resume_url ? 'View Resume' : 'No Resume',
      status: mapStatus(applicant.status),
      // Store original data for reference
      originalData: applicant,
    };
  });
};

/**
 * Maps the API status values to the ones expected by the UI
 */
const mapStatus = (
  status: 'applied' | 'reviewing' | 'rejected' | 'accepted'
): 'pending' | 'approved' | 'rejected' => {
  switch (status) {
    case 'applied':
    case 'reviewing':
      return 'pending';
    case 'accepted':
      return 'approved';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
};

/**
 * Format a date string as "DD Month YYYY"
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
