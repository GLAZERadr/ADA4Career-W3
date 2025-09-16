'use client';
import { Globe } from 'lucide-react';
import { usePathname as usePathnameDef } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { usePathname, useRouter } from '@/i18n/navigation';

const ChangeLangButton = () => {
  const defaultPathname = usePathnameDef();
  const [language, setLanguage] = React.useState(
    defaultPathname.split('/')[1] ?? 'en'
  );
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    router.replace(pathname, { locale: newLanguage });
  };

  const t = useTranslations('SwitchLanguage');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='flex rounded-full items-center gap-2'
        >
          <Globe size={16} />
          {t('switchLanguage')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={language === 'en' ? 'bg-slate-100 font-medium' : ''}
        >
          {t('english')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('id')}
          className={language === 'id' ? 'bg-slate-100 font-medium' : ''}
        >
          {t('indonesian')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChangeLangButton;
