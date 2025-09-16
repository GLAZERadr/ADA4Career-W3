import { BookOpen, ImageOff, MousePointer } from 'lucide-react';
import { useTranslations } from 'next-intl'; // Import useTranslations

import { Button } from '@/components/ui/button';

type OrientationAdjustmentsProps = {
  settings: {
    muteSounds: boolean;
    hideImages: boolean;
    readMode: boolean;
    readingGuide: boolean;
    readingMask: boolean;
    highlightHover: boolean;
    highlightFocus: boolean;
    cursor: 'default' | 'black' | 'white';
    stopAnimations: boolean;
  };
  updateSettings: (key: string, value: boolean | string) => void;
};

export function OrientationAdjustments({
  settings,
  updateSettings,
}: OrientationAdjustmentsProps) {
  const t = useTranslations('Accessibility.orientation'); // Add translation hook

  const toggleSetting = (key: keyof typeof settings, value?: string) => {
    if (typeof settings[key] === 'boolean') {
      updateSettings(key, !settings[key]);
    } else if (typeof settings[key] === 'string') {
      updateSettings(key, value ?? '');
    }
  };

  const toggleCursor = (
    current: 'default' | 'black' | 'white',
    newVal: 'default' | 'black' | 'white'
  ) => {
    let newCursor = current;
    if (current === newVal) {
      newCursor = 'default';
    } else if (current === 'default') {
      newCursor = newVal;
    } else {
      newCursor = newVal == 'black' ? 'black' : 'white';
    }
    updateSettings('cursor', newCursor);
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-medium text-gray-900'>{t('title')}</h3>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <Button
          variant={settings.hideImages ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleSetting('hideImages')}
          className='flex h-20 flex-col items-center justify-center gap-1 text-sm'
          aria-pressed={settings.hideImages}
        >
          <ImageOff className='h-4 w-4' />
          <span>{t('hideImages')}</span>
        </Button>

        <Button
          variant={settings.readMode ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleSetting('readMode')}
          className='flex h-20 flex-col items-center justify-center gap-1 text-sm'
          aria-pressed={settings.readMode}
        >
          <BookOpen className='h-4 w-4' />
          <span>{t('readMode')}</span>
        </Button>

        <Button
          variant={settings.cursor == 'black' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleCursor(settings.cursor, 'black')}
          className='flex h-20 flex-col items-center justify-center gap-1 text-sm'
          aria-pressed={settings.cursor == 'black'}
        >
          <MousePointer className='h-4 w-4' />
          <span>{t('bigBlackCursor')}</span>
        </Button>

        <Button
          variant={settings.cursor == 'white' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleCursor(settings.cursor, 'white')}
          className='flex h-20 flex-col items-center justify-center gap-1 text-sm'
          aria-pressed={settings.cursor == 'white'}
        >
          <MousePointer className='h-4 w-4' />
          <span>{t('bigWhiteCursor')}</span>
        </Button>
      </div>
    </div>
  );
}
