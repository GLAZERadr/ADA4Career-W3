import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import ChangeLangButton from '@/components/change-lang-button';
import AuthDialog from '@/components/features/auth/auth-dialog';

import logo from '~/images/ADALogo.png';

const NAV_LINKS = [
  {
    name: 'Home',
    url: '/',
  },
  {
    name: 'Products',
    url: '#product',
  },
];

const queryClient = new QueryClient();

const Navbar = () => {
  // const { user, isAuthenticated, isPending } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <nav
        className='max-w-6xl mx-auto py-4 px-4 relative'
        aria-label='Main navigation'
      >
        {/* Desktop Navigation */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-5'>
            <Link href='/' aria-label='Go to homepage'>
              <Image
                src={logo}
                alt='ADA Logo'
                className='mr-1'
                width={40}
                height={40}
                priority
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className='hidden md:flex md:items-center md:gap-5'>
              {NAV_LINKS.map((link) => (
                <Link
                  href={link.url}
                  key={link.name}
                  className='text-gray-700 hover:text-gradient-ms hover:font-medium transition-colors'
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Menu Items */}
          <div className='hidden md:flex md:items-center md:gap-8'>
            {/* {isAuthenticated ? (
              <Link href={`/app/${user?.role == 'jobseeker' ? 'home' : 'hr'}`}>
                <Button>
                  Go To Dashboard <ArrowRight />
                </Button>
              </Link>
            ) : (
            )} */}
            <ChangeLangButton />
            <QueryClientProvider client={queryClient}>
              <AuthDialog />
            </QueryClientProvider>
            {/* <LoginDialog />
            <RegisterDialog /> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden flex items-center p-2'
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls='mobile-menu'
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id='mobile-menu'
          className={`${
            isMenuOpen ? 'flex' : 'hidden'
          } absolute top-full left-0 right-0 flex-col w-full bg-white shadow-lg z-50 md:hidden`}
          aria-hidden={!isMenuOpen}
        >
          <div className='flex flex-col p-4 space-y-4'>
            {NAV_LINKS.map((link) => (
              <Link
                href={link.url}
                key={link.name}
                className='text-gray-700 hover:text-gradient-ms hover:font-medium py-2 transition-colors'
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className='flex flex-col space-y-4 pt-4 border-t'>
              <ChangeLangButton />
              <QueryClientProvider client={queryClient}>
                <AuthDialog />
              </QueryClientProvider>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
