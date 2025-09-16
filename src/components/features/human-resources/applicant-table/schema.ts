import { z } from 'zod';

export const applicantSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  cvLink: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  // Store the original data for reference
  originalData: z.any().optional(),
});

export type Applicant = z.infer<typeof applicantSchema>;

// Sample data for fallback
export const applicants: Applicant[] = [
  {
    id: '1',
    name: 'Nadia Omara',
    avatar:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1tuKxZ29VkjNlAhZd0vuby7BBpFGWu.png',
    position: 'UI/UX Designer',
    startDate: '11 November 2024',
    endDate: '11 February 2024',
    cvLink: 'CV_Nadia_Omara',
    status: 'pending',
  },
];
