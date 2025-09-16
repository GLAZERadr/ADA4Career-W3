import { Contrast, Droplet, Eye, Moon, Paintbrush, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl'; // Import useTranslations

import { Button } from '@/components/ui/button';

type ColorAdjustmentsProps = {
  settings: {
    contrast: 'default' | 'dark' | 'light' | 'high';
    saturation: 'default' | 'high' | 'low';
    monochrome: boolean;
    textColor: string;
    titleColor: string;
    backgroundColor: string;
  };
  updateSettings: (key: string, value: any) => void;
};

export function ColorAdjustments({
  settings,
  updateSettings,
}: ColorAdjustmentsProps) {
  const t = useTranslations('Accessibility.colors'); // Add translation hook

  const toggleSetting = (
    key: keyof Omit<
      typeof settings,
      'textColor' | 'titleColor' | 'backgroundColor'
    >
  ) => {
    updateSettings(key, !settings[key]);
  };

  const colorOptions = [
    '#8B5CF6',
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#EC4899',
    '#000000',
  ];

  const toggleContrast = (newVal: 'default' | 'dark' | 'light' | 'high') => {
    if (settings.contrast == newVal) {
      updateSettings('contrast', 'default');
    } else {
      updateSettings('contrast', newVal);
    }
  };

  const toggleSaturation = (newVal: 'default' | 'high' | 'low') => {
    if (settings.saturation == newVal) {
      updateSettings('saturation', 'default');
    } else {
      updateSettings('saturation', newVal);
    }
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-medium text-gray-900'>{t('title')}</h3>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <Button
          variant={settings.contrast == 'dark' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleContrast('dark')}
          className='flex h-20 flex-col items-center justify-center gap-1 text-sm'
          aria-pressed={settings.contrast == 'dark'}
        >
          <Moon className='h-4 w-4' />
          <span>{t('darkContrast')}</span>
        </Button>

        <Button
          variant={settings.contrast == 'light' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleContrast('light')}
          className='flex h-20 flex-col items-center justify-center gap-1 text-sm'
          aria-pressed={settings.contrast == 'light'}
        >
          <Sun className='h-4 w-4' />
          <span>{t('lightContrast')}</span>
        </Button>

        <Button
          variant={settings.contrast == 'high' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleContrast('high')}
          className='flex h-20 flex-col items-center justify-center gap-1 text-sm'
          aria-pressed={settings.contrast == 'high'}
        >
          <Eye className='h-4 w-4' />
          <span>{t('highContrast')}</span>
        </Button>

        <Button
          variant={settings.saturation == 'high' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleSaturation('high')}
          className='flex h-20 flex-col items-center justify-center gap-1 text-sm'
          aria-pressed={settings.saturation == 'high'}
        >
          <Droplet className='h-4 w-4' />
          <span>{t('highSaturation')}</span>
        </Button>

        <Button
          variant={settings.monochrome ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleSetting('monochrome')}
          className='flex h-20 flex-col items-center justify-center gap-1 text-sm'
          aria-pressed={settings.monochrome}
        >
          <Contrast className='h-4 w-4' />
          <span>{t('monochrome')}</span>
        </Button>

        <Button
          variant={settings.saturation == 'low' ? 'default' : 'outline'}
          size='sm'
          onClick={() => toggleSaturation('low')}
          className='flex h-20 flex-col items-center justify-center gap-1 text-sm'
          aria-pressed={settings.saturation == 'low'}
        >
          <Paintbrush className='h-4 w-4' />
          <span>{t('lowSaturation')}</span>
        </Button>
      </div>
    </div>
  );
}
