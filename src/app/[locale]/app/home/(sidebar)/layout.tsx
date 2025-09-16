'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl'; // Import useTranslations
import { useQueryState } from 'nuqs';
import type { ReactNode } from 'react';
import { Suspense } from 'react';

import ChangeLangButton from '@/components/change-lang-button';
import { AppSidebar } from '@/components/features/job-seeker/sidebar';
import UserProfileDropdown from '@/components/features/user-profile-dropdown';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

// Create a separate component for the parts that use useQueryState
function HeaderLabel() {
  const pathname = usePathname();
  const [conversationId] = useQueryState('conversationId');
  const [conversationTitle] = useQueryState('conversationTitle');
  const t = useTranslations('Dashboard.Layout'); // Add translation hook

  const getHeaderLabel = () => {
    if (pathname.includes('jobs')) {
      return t('jobRecommendation');
    } else if (pathname.includes('courses')) {
      return t('courseRecommendation');
    } else if (pathname.includes('chat')) {
      return conversationId ? 'Convo: ' + conversationTitle : t('chatWithAIDA');
    } else if (pathname.includes('career-tree')) {
      return t('careerTree');
    }
    return '';
  };

  return <h3 className='text-base truncate'>{getHeaderLabel()}</h3>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('Dashboard.Layout'); // Add translation hook

  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-screen'>
        <AppSidebar />
        <SidebarInset className='flex-1'>
          <header className='sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6'>
            <SidebarTrigger className='md:hidden' />

            {/* Wrap the component that uses useQueryState in Suspense */}
            <Suspense fallback={<h3>{t('loading')}</h3>}>
              <HeaderLabel />
            </Suspense>

            <div className='ml-auto flex items-center gap-3'>
              <ChangeLangButton />
              <UserProfileDropdown />
            </div>
          </header>
          <main className='flex-1 p-6 w-full'>{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
