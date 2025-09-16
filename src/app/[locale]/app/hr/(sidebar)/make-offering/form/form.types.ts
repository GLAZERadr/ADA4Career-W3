import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Define the base types
export type JobType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'fixed_term'
  | 'casual';
export type WorkplaceType = 'remote' | 'hybrid' | 'on_site';
export type AccessibilityLevel = 'high' | 'medium' | 'standard';

export interface Accommodation {
  type: string;
  description: string;
}

// Individual section schemas
export const basicInfoSchema = z.object({
  // email: z.string().email('Please enter a valid email address'),
  // company: z.string().min(2, 'Company name must be at least 2 characters'),
  division: z.string().min(1, 'Division is required'),
  department: z.string().optional(),
  location: z.string().optional(),
});

export const jobDetailsSchema = z.object({
  job_type: z.enum([
    'full_time',
    'part_time',
    'contract',
    'fixed_term',
    'casual',
  ] as const),
  workplace_type: z.enum(['remote', 'hybrid', 'on_site'] as const),
  stage: z.string().optional(),
  experience: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
});

export const jobDescriptionSchema = z.object({
  responsibilities: z
    .string()
    .min(10, 'Please provide detailed responsibilities'),
  qualification: z.string().min(10, 'Please provide detailed qualifications'),
});

export const inclusivitySchema = z.object({
  accessibility_level: z
    .enum(['high', 'medium', 'standard'] as const)
    .optional(),
  disability_friendly: z.boolean().optional(),
  inclusive_hiring_statement: z.string().optional(),
  accommodations: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
      })
    )
    .optional(),
});

export const mediaSchema = z.object({
  logo: z.string().optional(),
  additional_image_url: z.string().optional(),
});

// Combined schema for the entire form
export const jobPostingSchema = z.object({
  basicInfo: basicInfoSchema,
  jobDetails: jobDetailsSchema,
  jobDescription: jobDescriptionSchema,
  inclusivity: inclusivitySchema,
  media: mediaSchema,
});

// Type inference
export type JobPostingFormData = z.infer<typeof jobPostingSchema>;

export interface JobPostingSectionProps {
  form: UseFormReturn<JobPostingFormData>;
}
