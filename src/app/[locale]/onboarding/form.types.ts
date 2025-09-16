import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Individual section schemas
export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.string({
    message: 'Please enter a valid age',
  }),
  address: z.string().min(1, 'Please enter a valid address'),
  gender: z.enum(['male', 'female', 'other']),
  phoneNumber: z.string().optional(),
});

export const skillExperienceSchema = z.object({
  skill: z.array(z.string()),
  experience: z.string({ message: 'Please enter a valid experience' }),
});

export const expectationSchema = z.object({
  expectation: z.string().optional(),
});

export const companyAndPositionSchema = z.object({
  company: z.string({ message: 'Please enter a valid company name' }),
  position: z.string({ message: 'Please enter a valid position' }),
});

export const jobSeekerSchema = z.object({
  personalInfo: personalInfoSchema,
  skillExperience: skillExperienceSchema,
  expectation: expectationSchema,
});

export const hrFormSchema = z.object({
  personalInfo: personalInfoSchema,
  companyAndPosition: companyAndPositionSchema,
});

// Type inference
export type HRFormData = z.infer<typeof hrFormSchema>;
export type JobSeekerData = z.infer<typeof jobSeekerSchema>;

export interface JobSeekerSectionProps {
  form: UseFormReturn<JobSeekerData>;
}

export interface HumanResourcesSectionProps {
  form: UseFormReturn<HRFormData>;
}
