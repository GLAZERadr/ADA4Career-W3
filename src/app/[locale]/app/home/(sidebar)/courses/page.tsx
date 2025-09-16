'use client';
import { useQuery } from '@tanstack/react-query';
import { Clock, ExternalLink, Star, Users } from 'lucide-react';
import { useTranslations } from 'next-intl'; // Import useTranslations
import React from 'react';

import api from '@/lib/axios';

import useAuthStore from '@/store/useAuthStore';

import { API_AI_URL, API_BASE_URL } from '@/constant/config';

import {
  CourseRecommendation,
  RecommendationsResponse,
} from '@/types/response/ai';

const CoursePage = () => {
  const t = useTranslations('Courses.page'); // Add translation hook for page content

  const { user } = useAuthStore();
  const { data, isPending } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const responseRole = await api.post(
        `${API_BASE_URL}/generate-role/${user?.email}`
      );
      const role = responseRole.data.data;

      const response = await api.post<RecommendationsResponse>(
        `${API_AI_URL}/course-recommendations`,
        {
          job_role: role,
          skill: user?.job_seeker_data?.skill,
          experiences: user?.job_seeker_data?.experiences,
        }
      );
      return response.data.recommendations;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isPending) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      {/* <div className='flex items-center mb-8'>
        <GraduationCap className='w-8 h-8 text-blue-600 mr-3' />
        <h1 className='text-3xl font-bold text-gray-900'>
          {t('title')}
        </h1>
      </div> */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {data ? (
          data.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))
        ) : (
          <div className='col-span-full text-center text-gray-500'>
            {t('noCoursesFound')}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePage;

const LevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const t = useTranslations('Courses.levels'); // Add translation hook for levels

  const getBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Translate the level based on its value
  const getTranslatedLevel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return t('beginner');
      case 'intermediate':
        return t('intermediate');
      case 'advanced':
        return t('advanced');
      default:
        return level;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${getBadgeColor(
        level
      )}`}
    >
      {getTranslatedLevel(level)}
    </span>
  );
};

const CourseCard: React.FC<{ course: CourseRecommendation }> = ({ course }) => {
  const t = useTranslations('Courses.card'); // Add translation hook for card content

  // Mock data for demonstration - you can replace these with actual data from your API
  const duration = t('duration');
  const rating = 4.5;
  const studentsEnrolled = t('studentsEnrolled');

  return (
    <div className='bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-100'>
      <div className='p-6'>
        <div className='flex justify-between items-start mb-4'>
          <div>
            <h3 className='text-xl font-bold text-gray-900 mb-2 line-clamp-2'>
              {course.courseName}
            </h3>
            <div className='flex items-center space-x-2 mb-2 gap-2'>
              <LevelBadge level={course.level} />
              <span className='inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200'>
                {course.source}
              </span>
            </div>
          </div>
        </div>

        <p className='text-gray-600 mb-4 line-clamp-3'>{course.description}</p>

        <div className='grid grid-cols-3 gap-4 mb-4'>
          <div className='flex items-center'>
            <Clock className='w-4 h-4 text-gray-400 mr-2' />
            <span className='text-sm text-gray-600'>{duration}</span>
          </div>
          <div className='flex items-center'>
            <Star className='w-4 h-4 text-yellow-400 mr-2' />
            <span className='text-sm text-gray-600'>{rating}</span>
          </div>
          <div className='flex items-center'>
            <Users className='w-4 h-4 text-gray-400 mr-2' />
            <span className='text-sm text-gray-600'>{studentsEnrolled}</span>
          </div>
        </div>

        <div className='mt-4 pt-4 border-t border-gray-100'>
          <a
            href={course.url}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300'
          >
            {t('viewCourse')} <ExternalLink className='ml-2 w-4 h-4' />
          </a>
        </div>
      </div>
    </div>
  );
};
