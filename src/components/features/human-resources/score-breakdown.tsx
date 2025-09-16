import { Award, Briefcase, Check, Heart, TrendingUp, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { JobApplicant } from '@/types/response/job';

export interface ScoreBreakdownProps {
  applicant?: JobApplicant;
  className?: string;
}

const ScoreBreakdown = ({ applicant, className }: ScoreBreakdownProps) => {
  // Helper function to get the appropriate color based on score percentage
  const getScoreColor = (score: number, max = 100) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Helper function to determine if a score is considered "complete" or "good"
  const isScoreGood = (score: number, threshold = 60) => {
    return score >= threshold;
  };

  // Organize skills as an array if they come as a string
  const matchingSkills = applicant?.matching_skills || [];
  const missingSkills = applicant?.missing_skills || [];
  // Create score sections
  const scoreSections = [
    {
      id: 'skills',
      title: 'Technical Skills',
      icon: <TrendingUp className='h-6 w-6 text-white' />,
      score: applicant?.skills_score,
      maxScore: 40, // Assuming 40 is max score for skills
      description: applicant?.skills_reasoning,
      isCompleted: isScoreGood(applicant?.skills_score ?? 0, 30),
      badgeData: {
        matching: matchingSkills,
        missing: missingSkills,
      },
    },
    {
      id: 'experience',
      title: 'Work Experience',
      icon: <Briefcase className='h-6 w-6 text-white' />,
      score: applicant?.experience_score,
      maxScore: 30, // Assuming 25 is max score for experience
      description: applicant?.experience_reasoning,
      isCompleted: isScoreGood(applicant?.experience_score ?? 0, 15),
    },
    {
      id: 'expectations',
      title: 'Job Expectations',
      icon: <Award className='h-6 w-6 text-white' />,
      score: applicant?.expectations_score,
      maxScore: 20, // Assuming 15 is max score for expectations
      description: applicant?.expectations_reasoning,
      isCompleted: isScoreGood(applicant?.expectations_score ?? 0, 10),
    },
    {
      id: 'accessibility',
      title: 'Accessibility & Adaptability',
      icon: <Heart className='h-6 w-6 text-white' />,
      score: applicant?.accessibility_score,
      maxScore: 10, // Assuming 10 is max score for accessibility
      description: applicant?.accessibility_reasoning,
      isCompleted: isScoreGood(applicant?.accessibility_score ?? 0, 7),
    },
  ];

  return (
    <div className={className}>
      <h3 className='text-lg font-semibold mb-4'>
        Candidate Evaluation Breakdown
      </h3>
      <div className='space-y-6'>
        {scoreSections.map((section) => (
          <div
            key={section.id}
            className='bg-white rounded-lg shadow-sm border p-4'
          >
            <div className='flex items-start gap-4'>
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${getScoreColor(
                  section.score ?? 0,
                  section.maxScore
                )}`}
              >
                {section.icon}
              </div>

              <div className='flex-1'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='font-medium text-lg'>{section.title}</h3>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold'>
                      {section.score}/{section.maxScore}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        section.isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {section.isCompleted ? (
                        <Check className='h-4 w-4' />
                      ) : (
                        <X className='h-4 w-4' />
                      )}
                    </div>
                  </div>
                </div>

                <Progress
                  value={((section.score ?? 0) / section.maxScore) * 100}
                  className='h-2 mb-3'
                  // indicatorClassName={getScoreColor(
                  //   section.score,
                  //   section.maxScore
                  // )}
                />

                <p className='text-gray-600 text-sm mb-3'>
                  {section.description}
                </p>

                {section.id === 'skills' && (
                  <div className='mt-2 space-y-2'>
                    {section.badgeData?.matching &&
                      section.badgeData.matching.length > 0 && (
                        <div>
                          <h4 className='text-sm font-medium mb-1'>
                            Matching Skills:
                          </h4>
                          <div className='flex flex-wrap gap-1'>
                            {section.badgeData.matching.map(
                              (skill: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  className='bg-green-100 text-green-800 border-green-200'
                                >
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {section.badgeData?.missing &&
                      section.badgeData.missing.length > 0 && (
                        <div>
                          <h4 className='text-sm font-medium mb-1'>
                            Missing Skills:
                          </h4>
                          <div className='flex flex-wrap gap-1'>
                            {section.badgeData.missing.map(
                              (skill: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant='outline'
                                  className='text-red-500 border-red-200'
                                >
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-start gap-2'>
        <div className='mt-0.5'>ℹ️</div>
        <div>
          <strong>Analysis Summary:</strong> This candidate achieved a total
          score of{' '}
          <strong>
            {(applicant?.skills_score ?? 0) +
              (applicant?.experience_score ?? 0) +
              (applicant?.expectations_score ?? 0) +
              (applicant?.accessibility_score ?? 0)}
          </strong>{' '}
          points out of a possible 100. The evaluation was conducted using
          AIDA's natural language processing to analyze the candidate's resume
          and application materials.
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
