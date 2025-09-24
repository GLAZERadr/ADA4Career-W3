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

  // Dummy course data for demo purposes
  const dummyCourses: CourseRecommendation[] = [
    {
      courseName: 'Complete Web3 & Blockchain Development Bootcamp',
      description: 'Master blockchain development, smart contracts, and DeFi protocols. Learn Solidity, Ethereum, and build real-world Web3 applications.',
      level: 'Intermediate',
      source: 'Udemy',
      url: 'https://www.udemy.com/course/blockchain-developer/',
    },
    {
      courseName: 'Smart Contract Security & Auditing',
      description: 'Learn how to identify vulnerabilities in smart contracts and conduct professional security audits for DeFi protocols.',
      level: 'Advanced',
      source: 'ConsenSys Academy',
      url: 'https://consensys.net/academy/',
    },
    {
      courseName: 'Introduction to Cryptocurrency & DeFi',
      description: 'Understand the fundamentals of cryptocurrency, decentralized finance, and how blockchain technology works.',
      level: 'Beginner',
      source: 'Coursera',
      url: 'https://www.coursera.org/learn/cryptocurrency',
    },
    {
      courseName: 'React for Web3 Development',
      description: 'Build modern Web3 user interfaces using React, Web3.js, and Ethers.js. Connect to wallets and interact with smart contracts.',
      level: 'Intermediate',
      source: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/',
    },
    {
      courseName: 'Solidity Programming Fundamentals',
      description: 'Learn to write secure smart contracts using Solidity. Cover gas optimization, design patterns, and testing strategies.',
      level: 'Beginner',
      source: 'Ethereum.org',
      url: 'https://ethereum.org/en/developers/docs/smart-contracts/',
    },
    {
      courseName: 'NFT Development & Marketplace Creation',
      description: 'Create your own NFT collection and marketplace. Learn about ERC-721, ERC-1155 standards and IPFS integration.',
      level: 'Intermediate',
      source: 'YouTube',
      url: 'https://www.youtube.com/watch?v=WsZBNW82HpE',
    },
    {
      courseName: 'DeFi Protocol Development',
      description: 'Build decentralized finance protocols including DEXs, lending platforms, and yield farming mechanisms.',
      level: 'Advanced',
      source: 'Alchemy University',
      url: 'https://www.alchemy.com/university',
    },
    {
      courseName: 'Blockchain Career Transition Guide',
      description: 'Complete guide to transitioning into a blockchain career. Includes portfolio building, networking, and job interview preparation.',
      level: 'Beginner',
      source: 'ADA4Career',
      url: 'https://ada4career.com/courses/blockchain-career-guide',
    }
  ];

  const { user } = useAuthStore();
  const { data, isPending, error } = useQuery<CourseRecommendation[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      // Always use dummy data for demo purposes
      console.log('Using dummy courses data for demo');
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      return dummyCourses;
    },
    retry: false, // Don't retry on error
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

  if (error) {
    console.error('Courses page error:', error);
    // Fallback to dummy data if there's an error
    return (
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {dummyCourses.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))}
        </div>
      </div>
    );
  }

  const coursesToDisplay = data && data.length > 0 ? data : dummyCourses;

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      {/* <div className='flex items-center mb-8'>
        <GraduationCap className='w-8 h-8 text-blue-600 mr-3' />
        <h1 className='text-3xl font-bold text-gray-900'>
          {t('title')}
        </h1>
      </div> */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {coursesToDisplay.map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
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
