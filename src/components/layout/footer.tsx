import Link from 'next/link';
import React from 'react';

import { Separator } from '@/components/ui/separator';

const FOOTER_ITEMS = [
  {
    label: 'About Us',
    url: '/',
  },
  {
    label: 'Contact',
    url: '/',
  },
  {
    label: 'Privacy Policy',
    url: '/',
  },
  {
    label: 'Sitemap',
    url: '/',
  },
  {
    label: 'Terms of Use',
    url: '/',
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className='py-8 sm:py-12 md:py-16 lg:py-28 px-4 sm:px-8 md:px-16 lg:px-36'
      aria-label='Site footer'
    >
      <div className='text-gray-700 max-w-6xl mx-auto'>
        <Separator role='presentation' />

        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-6'>
          {/* Footer Links */}
          <nav aria-label='Footer navigation'>
            <ul className='flex flex-wrap items-center gap-4 sm:gap-6 md:gap-10'>
              {FOOTER_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.url}
                    className='hover:text-gradient-ms transition-colors text-sm md:text-base'
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Copyright Text */}
          <p className='text-sm md:text-base order-first sm:order-last mt-2 sm:mt-0'>
            © 2024-{currentYear}, All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
