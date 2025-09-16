export type JobType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'fixed_term'
  | 'casual';
export type WorkplaceType = 'remote' | 'hybrid' | 'on_site';
export type AccessibilityLevel = 'high' | 'medium' | 'standard';

export interface Accommodation {
  id: string; // Added id field
  type: string;
  description: string;
}

export interface SkillScore {
  skills_score: number;
  skills_reasoning: string;
  experience_score: number;
  experience_reasoning: string;
  expectations_score: number;
  expectations_reasoning: string;
  accessibility_score: number;
  accessibility_reasoning: string;
}

export interface JobPostingData {
  id: string;
  email: string;
  division: string;
  job_type: JobType;
  workplace_type: WorkplaceType;
  start_date: string; // ISO date format (YYYY-MM-DD)
  end_date: string; // ISO date format (YYYY-MM-DD)
  responsibilities: string;
  qualification: string;
  additional_image_url: string; // Renamed from additionalImageUrl to match snake_case
}

export interface JobPostingDataExtended extends JobPostingData {
  company?: string;
  department?: string;
  stage?: string;
  location?: string;
  experience?: string;
  logo?: string;

  // Match-related fields
  match_percentage?: number;
  matching_skills?: string[]; // New field
  missing_skills?: string[]; // New field
  score_breakdown?: SkillScore; // New field for detailed scoring

  posted_time?: string;
  created_at?: string; // New field
  updated_at?: string; // New field

  // Accessibility and inclusivity fields
  accessibility_level?: AccessibilityLevel;
  accommodations?: Accommodation[];
  disability_friendly?: boolean;
  inclusive_hiring_statement?: string;
}

export interface HRRawJobApplicantData
  extends Omit<JobPostingDataExtended, 'score_breakdown'> {
  skills_score: number;
  skills_reasoning: string;
  experience_score: number;
  experience_reasoning: string;
  expectations_score: number;
  expectations_reasoning: string;
  accessibility_score: number;
  accessibility_reasoning: string;
}

export interface JobPostingWithApplicants extends JobPostingDataExtended {
  applicants?: JobApplicant[]; // Store all applicants for the job
  acceptedApplicant?: JobApplicant[]; // Store only accepted applicants
  rejectedApplicant?: JobApplicant[]; // Store only rejected applicants
  appliedApplicant?: JobApplicant[]; // Store only applied applicants
}

export type JobApplicant = {
  id: string;
  job_vacancy_id: string;
  job_seeker_email: string;
  job_score_id: string;
  status: 'applied' | 'reviewing' | 'rejected' | 'accepted'; // Add more statuses if needed
  applied_date: string; // Consider using Date if you want to handle it as a date object
  cover_letter: string;
  resume_url: string;

  // Additional fields
  match_percentage?: number;
  matching_skills: string[]; // New field
  missing_skills: string[]; // New field
  skills_score: number;
  skills_reasoning: string;
  experience_score: number;
  experience_reasoning: string;
  expectations_score: number;
  expectations_reasoning: string;
  accessibility_score: number;
  accessibility_reasoning: string;
};

export interface ApplicantWithJobDetails extends JobApplicant {
  jobDetails?: JobPostingDataExtended;
}
