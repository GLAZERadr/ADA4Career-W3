import {
  HRRawJobApplicantData,
  JobPostingDataExtended,
  SkillScore,
} from '@/types/response/job';

/**
 * Converts HRRawJobApplicantData to JobPostingDataExtended format
 * @param hrData The raw HR job applicant data
 * @returns The data in JobPostingDataExtended format
 */
export function convertHRDataToJobPostingExtended(
  hrData: HRRawJobApplicantData
): JobPostingDataExtended {
  // Extract the flattened score breakdown fields
  const {
    skills_score,
    skills_reasoning,
    experience_score,
    experience_reasoning,
    expectations_score,
    expectations_reasoning,
    accessibility_score,
    accessibility_reasoning,
    ...restData
  } = hrData;

  // Create the score_breakdown object
  const score_breakdown: SkillScore = {
    skills_score,
    skills_reasoning,
    experience_score,
    experience_reasoning,
    expectations_score,
    expectations_reasoning,
    accessibility_score,
    accessibility_reasoning,
  };

  // Combine everything into the JobPostingDataExtended format
  const jobPostingData: JobPostingDataExtended = {
    ...restData,
    score_breakdown,
  };

  return jobPostingData;
}

// Usage example:
// const response = await api.get<ApiReturn<HRRawJobApplicantData>>(`${API_BASE_URL}/job-vacancy/${id}?email=${user?.email}`);
// const jobPostingData = convertHRDataToJobPostingExtended(response.data.data);
// return jobPostingData;
