'use client';

import React from 'react';

import { SkillScore } from '@/types/response/job';

interface SegmentedProgressBarProps {
  scoreBreakdown: SkillScore | undefined;
  height?: number;
  barClassName?: string;
  showLabels?: boolean;
  animated?: boolean;
}

export function SegmentedProgressBar({
  scoreBreakdown,
  height = 24,
  barClassName = 'rounded-full overflow-hidden',
  showLabels = true,
  animated = true,
}: SegmentedProgressBarProps) {
  // Define colors for each segment
  const colors = {
    skills: '#10b981', // green
    experience: '#3b82f6', // blue
    expectations: '#f59e0b', // amber
    accessibility: '#ec4899', // pink
  };

  // Define max scores for each category
  const maxScores = {
    skills: 40,
    experience: 30,
    expectations: 20,
    accessibility: 10,
  };

  // Calculate total score
  const totalScore =
    (scoreBreakdown?.skills_score || 0) +
    (scoreBreakdown?.experience_score || 0) +
    (scoreBreakdown?.expectations_score || 0) +
    (scoreBreakdown?.accessibility_score || 0);

  const maxPossibleScore = 100; // Total max score is still 100

  // Calculate what percentage of the bar each segment should take
  const segments = [
    {
      name: 'Skills',
      score: scoreBreakdown?.skills_score || 0,
      maxScore: maxScores.skills,
      color: colors.skills,
      percentage:
        ((scoreBreakdown?.skills_score || 0) / maxPossibleScore) * 100,
    },
    {
      name: 'Experience',
      score: scoreBreakdown?.experience_score || 0,
      maxScore: maxScores.experience,
      color: colors.experience,
      percentage:
        ((scoreBreakdown?.experience_score || 0) / maxPossibleScore) * 100,
    },
    {
      name: 'Expectations',
      score: scoreBreakdown?.expectations_score || 0,
      maxScore: maxScores.expectations,
      color: colors.expectations,
      percentage:
        ((scoreBreakdown?.expectations_score || 0) / maxPossibleScore) * 100,
    },
    {
      name: 'Accessibility',
      score: scoreBreakdown?.accessibility_score || 0,
      maxScore: maxScores.accessibility,
      color: colors.accessibility,
      percentage:
        ((scoreBreakdown?.accessibility_score || 0) / maxPossibleScore) * 100,
    },
  ];

  return (
    <div className='w-full'>
      {/* Progress bar container */}
      <div
        className={`w-full bg-gray-200 ${barClassName}`}
        style={{ height: `${height}px` }}
        role='progressbar'
        aria-valuenow={totalScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Total score: ${totalScore} out of 100`}
      >
        <div className='flex h-full'>
          {segments.map((segment, index) => (
            <div
              key={segment.name}
              style={{
                width: `${segment.percentage}%`,
                backgroundColor: segment.color,
                transition: animated ? 'width 1s ease-in-out' : 'none',
              }}
              className={`h-full ${index === 0 ? 'rounded-l-full' : ''} ${
                index === segments.length - 1 ? 'rounded-r-full' : ''
              }`}
              aria-hidden='true'
            />
          ))}
        </div>
      </div>

      {/* Labels */}
      {showLabels && (
        <div className='flex flex-wrap justify-between mt-2 gap-y-2'>
          {segments.map((segment) => (
            <div key={`label-${segment.name}`} className='flex items-center'>
              <div
                className='w-3 h-3 rounded-full mr-1 flex-shrink-0'
                style={{ backgroundColor: segment.color }}
                aria-hidden='true'
              />
              <span className='text-xs whitespace-nowrap'>
                {segment.name}: {segment.score}/{segment.maxScore}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
