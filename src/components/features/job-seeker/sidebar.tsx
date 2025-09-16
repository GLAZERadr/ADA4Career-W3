'use client';

import { BookOpen, Home, MessageCircle, TreeDeciduous } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl'; // Import useTranslations

import AdaLogo from '@/components/ada-logo';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations('Dashboard.Sidebar'); // Add translation hook

  // Updated sidebar items with translation function calls
  const SIDEBAR_ITEMS = [
    {
      icon: <Home className='h-12 w-12' />,
      url: '/app/home/jobs',
      label: t('home'),
    },
    {
      icon: <BookOpen className='h-12 w-12' />,
      url: '/app/home/courses',
      label: t('courses'),
    },
    // {
    //   icon: <Briefcase className='h-12 w-12' />,
    //   url: '/app/home/jobs',
    //   label: 'Job Matching',
    // },
    {
      icon: <MessageCircle className='h-12 w-12' />,
      url: '/app/home/chat',
      label: t('aidaChat'),
    },
    {
      icon: <TreeDeciduous className='h-12 w-12' />,
      url: '/app/home/career-tree',
      label: t('careerTree'),
    },
  ];

  return (
    <Sidebar className='border-r'>
      <SidebarHeader className='flex h-16 items-center justify-center border-b'>
        <div className='flex items-center justify-center'>
          <AdaLogo />
        </div>
      </SidebarHeader>
      <SidebarContent className=''>
        <SidebarMenu className='flex flex-col justify-evenly py-4 h-full'>
          {SIDEBAR_ITEMS.map(({ icon, url, label }) => {
            // Check if current path matches this menu item's URL
            // Also handle sub-paths (e.g., /app/courses/123 should highlight the Courses item)
            const isActive = pathname === url || pathname.startsWith(`${url}/`);

            return (
              <SidebarMenuItem key={url}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link
                    href={url}
                    className={`flex h-fit flex-col items-center gap-2 `}
                  >
                    {icon}
                    <span className='text-sm'>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
