'use client';

import { Waypoints } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import * as React from 'react';
import '@/lib/env';

import { AchievementCard } from '@/components/achievement-card';
import Navbar from '@/components/layout/navbar';

/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

const FLOATING_ITEMS = [
  {
    title: 'What can you achieve with ADA',
    points: [
      'Unlock job opportunities that match your skills and career goals.',
      'Apply with confidence using optimized resumes and tailored recommendations.',
      'Get continuous support with career and skill development guidance.',
    ],
  },
  {
    title: 'What is ADA',
    points: [
      'ADA is an intelligent job platform that`s equally accessible for everyone. Our mission is to empowering job seekers with disabilities and enabling inclusive hiring through intelligent, accessible AI-driven solutions',
    ],
  },
  {
    title: 'What sets ADA apart',
    points: [
      'We help you find the right job, tailored to your unique skills and abilities.',
      'An easy-to-use, fully accessible platform designed for your needs.',
      'Our commitment to inclusion, driven by the #PastiADAKarier campaign, connects you with employers who value your talent.',
    ],
  },
];

import Footer from '@/components/layout/footer';

import mainGif from '~/gif/people-gif.gif';
import cv from '~/images/cvimg.png';

export default function HomePage() {
  return (
    <main>
      <Head>
        <title>Hi</title>
      </Head>
      <section className='bg-white'>
        <Navbar />
      </section>
      <section>
        <main className='text-center mt-10  mx-auto max-w-6xl px-4 w-full flex flex-col items-center'>
          <h1 className='font-medium text-2xl sm:text-2xl md:text-3xl'>
            ADA.AI
          </h1>
          <h2 className='font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gradient-ms pb-2 mt-2'>
            Your Accessible AI Career Platform
          </h2>{' '}
          <div className='relative  w-full flex items-center justify-center my-12'>
            <AchievementCard
              type='points'
              points={FLOATING_ITEMS[0].points}
              title={FLOATING_ITEMS[0].title}
              imageAlt='Achievement Logo'
              className='hidden md:inline absolute left-0 top-1/2'
            />
            <AchievementCard
              type='desc'
              description={FLOATING_ITEMS[1].points[0]}
              title={FLOATING_ITEMS[1].title}
              imageAlt='Achievement Logo'
              className='hidden md:inline absolute right-0 top-0'
            />
            <AchievementCard
              type='points'
              points={FLOATING_ITEMS[2].points}
              description='loremipsum dolor'
              title={FLOATING_ITEMS[2].title}
              imageAlt='Achievement Logo'
              className='hidden md:inline absolute right-0 bottom-0'
            />

            <Image
              className='translate-x-20'
              src={mainGif}
              alt='GIF People searching Jobs'
              width={900}
              style={{
                animation: 'infinite',
              }}
              height={900}
            />
          </div>
          <div className='w-full py-2 px-2 rounded-md'>
            <div className='text-center px-4 md:px-0'>
              <h2 className='text-gradient-ms text-3xl sm:text-4xl md:text-5xl pt-4'>
                Don't Worry, #PastiADAKarier!
              </h2>
              <p className='text-gray-500 text-center mt-3 text-sm sm:text-base'>
                Empowering job seekers with disabilities by offering
                intelligent, AI-driven solutions that make it easier
                {/* Only show line break on larger screens */}
                <span className='hidden md:inline'>
                  <br />
                </span>
                to find inclusive opportunities and connect with employers who
                value your unique talents.
              </p>
            </div>{' '}
            <div
              id='product'
              className='mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-5 md:gap-6 text-start px-4 md:px-0'
              aria-labelledby='product-heading'
            >
              <h2 id='product-heading' className='sr-only'>
                Our Products
              </h2>

              {/* Job Matching Algorithm */}
              <div className='lg:col-span-5 rounded-md border-gradient-ms flex items-center justify-center'>
                <div className='grid grid-cols-1 sm:grid-cols-7 p-6 sm:p-10 w-full'>
                  <div className='w-14 h-14 rounded-full bg-ms-rainbow text-white border border-indigo-500 flex items-center justify-center mb-4 sm:mb-0 mx-auto sm:mx-0'>
                    <Waypoints aria-hidden='true' />
                  </div>
                  <div className='flex flex-col gap-2 sm:col-span-6'>
                    <h3 className='font-semibold text-xl sm:text-2xl text-gradient-ms text-center sm:text-left'>
                      Inclusive Job Matching Algorithm
                    </h3>
                    <p className='text-sm leading-loose font-light'>
                      An inclusive job matching algorithm that connects
                      candidates to opportunities by focusing on skills and
                      potential, with just one click to submit your CV. Say
                      goodbye to the stress of hunting across multiple job
                      platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* CV Builder */}
              <div className='lg:col-span-2 text-white flex flex-col gap-5 rounded-md bg-gradient-to-b from-[#988bea] to-[#8A79FD] px-4 pt-8'>
                <h3 className='font-semibold text-xl'>AI Powered CV Builder</h3>
                <p className='text-sm leading-relaxed font-light'>
                  No CV? No problem. Our AI-powered CV Builder creates a
                  professional, tailored resume from scratch. Just provide your
                  background, and our AI will craft a polished, optimized CV
                  that highlights your skills, experience, and strengths—making
                  job applications easier than ever
                </p>
                <div className='flex justify-center'>
                  <Image
                    alt='CV Builder preview'
                    src={cv}
                    width={260}
                    height={194}
                    className='translate-y-3 object-contain'
                  />
                </div>
              </div>

              {/* Web3 Demo */}
              <div className='lg:col-span-7 text-white flex flex-col gap-5 rounded-md bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] px-6 py-8'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-12 h-12 rounded-full bg-white/20 flex items-center justify-center'>
                    <span className='text-2xl'>🚀</span>
                  </div>
                  <h3 className='font-semibold text-2xl'>Web3 CV Builder Demo</h3>
                </div>
                <p className='text-sm leading-relaxed font-light mb-4'>
                  Experience our blockchain-powered CV builder! Connect your MetaMask wallet,
                  create your professional CV, and submit it to the Lisk Sepolia testnet for
                  permanent blockchain verification. Features wallet authentication, smart contract
                  integration, and decentralized storage.
                </p>
                <div className='flex gap-4'>
                  <a
                    href='/en/web3-demo'
                    className='inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <span>🔗</span>
                    Web3 Features
                  </a>
                  <a
                    href='/en/app/cv-builder'
                    className='inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors'
                  >
                    <span>📋</span>
                    CV Builder
                  </a>
                </div>
              </div>

              {/* Courses & Career */}
              <div className='lg:col-span-2 text-white flex flex-col gap-5 rounded-md bg-gradient-to-b from-[#988bea] to-[#8A79FD] px-4 py-8'>
                <h3 className='font-semibold text-xl'>
                  Courses & Career Update Recommendation
                </h3>
                <p className='text-sm leading-relaxed font-light'>
                  This feature provides a dynamic career pathway update, guiding
                  users from entry-level roles, like Junior Developer, to
                  advanced positions, such as Senior Developer. <br />
                  <br />
                  Progression is based on assessment tests that identify skill
                  gaps and growth areas, while recommended courses are tailored
                  to help users prepare for each assessment.
                </p>
              </div>

              {/* AIDA Feature */}
              <div className='lg:col-span-5 p-4 overflow-hidden rounded-md border-gradient-ms items-center justify-center grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex flex-col gap-y-3'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='text-xl text-gradient-ms font-semibold'>
                      Say hi to AIDA, your AI Career Assistant
                    </h3>
                  </div>
                  <p className='leading-relaxed font-light'>
                    AIDA offers quick, easy-to-digest insights and reminders to
                    keep you focused and confident as you work toward your
                    career goals. It helps you find the right job, stand out in
                    interviews with relevant company insights, and see why
                    you're the perfect fit.
                  </p>
                </div>
                <div className='flex justify-center'>
                  <video
                    src='/vid/aida.webm'
                    width={480}
                    height={240}
                    autoPlay
                    playsInline
                    muted
                    loop
                    aria-label='Demo of AIDA AI assistant in action'
                    style={{ maxWidth: '100%', height: 'auto' }}
                  ></video>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>
      <section>
        <Footer />
      </section>
    </main>
  );
}
