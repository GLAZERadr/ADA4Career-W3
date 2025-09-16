import Image from 'next/image';
import * as React from 'react';

import { cn } from '@/lib/utils';

import achievement from '~/images/achievelogo.png';

const AchievementCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    imageAlt: string;
    title: string;
    description?: string;
    points?: string[];
    type?: 'points' | 'desc';
  }
>(
  (
    {
      className,
      imageAlt,
      title,
      description,
      points,
      type = 'points',
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'max-w-[480px] bg-opacity-80 z-20 rounded bg-white text-start ',
        className
      )}
    >
      <div className={cn('p-3 flex items-start gap-3')} {...props}>
        <Image
          src={achievement}
          width={24}
          height={24}
          alt={imageAlt}
          className='flex-shrink-0'
        />
        <div>
          <p className='font-bold text-start'>{title}</p>
          {type == 'desc' ? (
            <p className='text-[13px] font-medium'>{description}</p>
          ) : (
            <ul className='list-disc'>
              {points?.map((p) => (
                <li className='text-[13px] font-medium' key={p}>
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
);
AchievementCard.displayName = 'AchievementCard';

export { AchievementCard };
