import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { AccessibilityLevel } from '@/types/response/job';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// Helper function to generate random location
export function getRandomLocation() {
  const locations = [
    'New York, NY',
    'San Francisco, CA',
    'Seattle, WA',
    'Austin, TX',
    'Boston, MA',
    'Chicago, IL',
    'Los Angeles, CA',
    'Denver, CO',
    'Miami, FL',
    'Portland, OR',
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

// Helper function to generate random experience
export function getRandomExperience() {
  const experiences = [
    '1+ years exp',
    '2+ years exp',
    '3-5 years exp',
    '5+ years exp',
    'Entry level',
    'Mid-level',
    'Senior level',
  ];
  return experiences[Math.floor(Math.random() * experiences.length)];
}

// Helper function to generate random company
export function getRandomCompany() {
  const companies = [
    'TechCorp',
    'InnovateSoft',
    'DataSphere',
    'CloudNine',
    'PixelPerfect',
    'CodeCraft',
    'ByteWorks',
    'NexGen Solutions',
    'Quantum Tech',
    'FutureSystems',
  ];
  return companies[Math.floor(Math.random() * companies.length)];
}

// Helper function to generate random stage
export function getRandomStage() {
  const stages = [
    'Early Stage',
    'Growing',
    'Established',
    'Scaling',
    'Enterprise',
  ];
  return stages[Math.floor(Math.random() * stages.length)];
}

export function getRandomAccessibilityLevel(): AccessibilityLevel {
  const levels: AccessibilityLevel[] = ['high', 'medium', 'standard'];
  return levels[Math.floor(Math.random() * levels.length)];
}

// Helper function to generate random accommodations
// export function getRandomAccommodations(): Accommodation[] {
//   const allAccommodations: Accommodation[] = [
//     { type: 'Physical', description: 'Wheelchair accessible workplace' },
//     { type: 'Physical', description: 'Adjustable height desks' },
//     { type: 'Physical', description: 'Ergonomic equipment available' },
//     { type: 'Visual', description: 'Screen reader compatible software' },
//     { type: 'Visual', description: 'Braille signage throughout office' },
//     {
//       type: 'Visual',
//       description: 'High contrast mode for all internal software',
//     },
//     { type: 'Auditory', description: 'Sign language interpreters available' },
//     { type: 'Auditory', description: 'Captioning for all meetings' },
//     { type: 'Auditory', description: 'Sound-dampened work areas' },
//     { type: 'Cognitive', description: 'Flexible deadlines when needed' },
//     {
//       type: 'Cognitive',
//       description: 'Written instructions provided for all tasks',
//     },
//     { type: 'Cognitive', description: 'Quiet spaces for focused work' },
//     { type: 'Schedule', description: 'Flexible working hours' },
//     { type: 'Schedule', description: 'Part-time options available' },
//     { type: 'Schedule', description: 'Extended breaks as needed' },
//     { type: 'Remote', description: 'Full remote work option' },
//     { type: 'Remote', description: 'Hybrid schedule available' },
//     { type: 'Remote', description: 'Home office equipment provided' },
//   ];

//   // Shuffle and select 3-6 random accommodations
//   const shuffled = [...allAccommodations].sort(() => 0.5 - Math.random());
//   return shuffled.slice(0, Math.floor(Math.random() * 4) + 3);
// }

// Helper function to generate inclusive hiring statements
export function getRandomInclusiveStatement(): string {
  const statements = [
    'We are committed to creating an inclusive workplace that promotes and values diversity. We actively seek applicants from diverse backgrounds, including those with disabilities.',
    'Our company believes that diversity drives innovation. We encourage applications from people with disabilities and provide reasonable accommodations throughout the hiring process and employment.',
    'We are an equal opportunity employer that values the unique perspectives of all individuals. We provide accommodations for people with disabilities and ensure an accessible application process.',
    'Our inclusive culture welcomes people of all abilities. We are committed to providing reasonable accommodations to qualified individuals with disabilities throughout our employment process.',
    'We believe that everyone deserves the opportunity to succeed. Our company is dedicated to creating an accessible workplace where people with disabilities can thrive.',
    'Diversity of thought, background, and ability strengthens our team. We actively recruit people with disabilities and ensure our workplace is accessible to all.',
    'We are proud to be a disability-inclusive employer. Our commitment includes accessible technology, workplace accommodations, and inclusive hiring practices.',
  ];

  return statements[Math.floor(Math.random() * statements.length)];
}
