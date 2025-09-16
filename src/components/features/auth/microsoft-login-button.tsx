import Image from 'next/image';
import React from 'react';
import { toast } from 'react-toastify';

interface MicrosoftLoginButtonProps {
  isLoading?: boolean;
  className?: string;
  text?: string;
}

import logo from '~/images/microsoft-logo.webp';

export const MicrosoftLoginButton: React.FC<MicrosoftLoginButtonProps> = ({
  isLoading = false,
  className = '',
  text = 'Continue with Microsoft',
}) => {
  const clickHandler = async () => {
    toast.error('Cannot login with Microsoft, please try again later', {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      role: 'alert', // Tambahkan role alert
    });
  };

  return (
    <button
      type='button'
      onClick={clickHandler}
      disabled={isLoading}
      aria-disabled={isLoading} // Tambahkan aria-disabled untuk screen reader
      className={`
        flex items-center justify-center gap-2 md:gap-3
        w-full 
        px-4 py-2
        rounded-md
        bg-white hover:bg-gray-50 active:bg-gray-100
        border border-gray-300
        text-gray-800 font-medium text-sm md:text-base
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-70 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={text}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <svg
          className='animate-spin h-5 w-5 text-gray-500'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
      ) : (
        <div className='relative w-5 h-5 md:w-6 md:h-6 flex-shrink-0'>
          <Image
            src={logo}
            alt='Microsoft logo' // Tambahkan alt text yang lebih jelas
            width={20}
            height={20}
            priority
          />
        </div>
      )}
      <span>{text}</span>
    </button>
  );
};
