import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Heading,
  Link,
  MousePointerClick,
  Type,
  ZoomIn,
} from 'lucide-react';
import { useTranslations } from 'next-intl'; // Import useTranslations

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type ContentAdjustmentsProps = {
  settings: {
    contentScaling: 'default' | 'large' | 'larger';
    readableFont: boolean;
    highlightTitles: boolean;
    highlightLinks: boolean;
    highlightHover: boolean;
    fontSize: 'default' | 'large' | 'larger';
    lineHeight: 'default' | 'large' | 'larger';
    letterSpacing: 'default' | 'large' | 'larger';
    alignment: 'left' | 'center' | 'right' | 'default' | 'justify';
  };
  updateSettings: (key: string, value: any) => void;
};

export function ContentAdjustments({
  settings,
  updateSettings,
}: ContentAdjustmentsProps) {
  const t = useTranslations('Accessibility.content'); // Add translation hook

  const toggleBooleanSetting = (
    key: keyof Pick<
      typeof settings,
      'readableFont' | 'highlightTitles' | 'highlightLinks' | 'highlightHover'
    >
  ) => {
    updateSettings(key, !settings[key]);
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-medium text-gray-900'>{t('title')}</h3>
      </div>

      <div className='space-y-4'>
        <div className='rounded-md border border-gray-200 p-4'>
          <div className='mb-4 flex items-center'>
            <ZoomIn className='mr-2 h-4 w-4' />
            <span className='font-medium'>{t('contentScaling')}</span>
          </div>
          <RadioGroup
            value={settings.contentScaling}
            onValueChange={(value: string) =>
              updateSettings('contentScaling', value)
            }
            className='flex justify-between'
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value='default'
                id='content-default'
                className='text-purple-600'
              />
              <Label htmlFor='content-default' className='text-sm'>
                {t('default')}
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value='large'
                id='content-large'
                className='text-purple-600'
              />
              <Label htmlFor='content-large' className='text-sm'>
                {t('large')}
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value='larger'
                id='content-larger'
                className='text-purple-600'
              />
              <Label htmlFor='content-larger' className='text-sm'>
                {t('larger')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button
            variant={settings.readableFont ? 'default' : 'outline'}
            size='sm'
            onClick={() => toggleBooleanSetting('readableFont')}
            className='flex h-16 items-center justify-center gap-2 text-sm'
            aria-pressed={settings.readableFont}
          >
            <Type className='h-4 w-4' />
            <span>{t('readableFont')}</span>
          </Button>

          <Button
            variant={settings.highlightTitles ? 'default' : 'outline'}
            size='sm'
            onClick={() => toggleBooleanSetting('highlightTitles')}
            className='flex h-16 items-center justify-center gap-2 text-sm'
            aria-pressed={settings.highlightTitles}
          >
            <Heading className='h-4 w-4' />
            <span>{t('highlightTitles')}</span>
          </Button>

          <Button
            variant={settings.highlightLinks ? 'default' : 'outline'}
            size='sm'
            onClick={() => toggleBooleanSetting('highlightLinks')}
            className='flex h-16 items-center justify-center gap-2 text-sm'
            aria-pressed={settings.highlightLinks}
          >
            <Link className='h-4 w-4' />
            <span>{t('highlightLinks')}</span>
          </Button>

          <Button
            variant={settings.highlightHover ? 'default' : 'outline'}
            size='sm'
            onClick={() => toggleBooleanSetting('highlightHover')}
            className='flex h-16 items-center justify-center gap-2 text-sm'
            aria-pressed={settings.highlightHover}
          >
            <MousePointerClick className='h-4 w-4' />
            <span>{t('highlightHover')}</span>
          </Button>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button
            variant={settings.alignment == 'center' ? 'default' : 'outline'}
            size='sm'
            onClick={() =>
              updateSettings(
                'alignment',
                settings.alignment == 'center' ? 'default' : 'center'
              )
            }
            className='flex h-12 items-center justify-center gap-2 text-sm'
            aria-pressed={settings.alignment === 'center'}
          >
            <AlignCenter className='h-4 w-4' />
            <span>{t('alignCenter')}</span>
          </Button>

          <Button
            variant={settings.alignment == 'left' ? 'default' : 'outline'}
            size='sm'
            onClick={() =>
              updateSettings(
                'alignment',
                settings.alignment == 'left' ? 'default' : 'left'
              )
            }
            className='flex h-12 items-center justify-center gap-2 text-sm'
            aria-pressed={settings.alignment === 'left'}
          >
            <AlignLeft className='h-4 w-4' />
            <span>{t('alignLeft')}</span>
          </Button>

          <Button
            variant={settings.alignment == 'right' ? 'default' : 'outline'}
            size='sm'
            onClick={() =>
              updateSettings(
                'alignment',
                settings.alignment == 'right' ? 'default' : 'right'
              )
            }
            className='flex h-12 items-center justify-center gap-2 text-sm'
            aria-pressed={settings.alignment === 'right'}
          >
            <AlignRight className='h-4 w-4' />
            <span>{t('alignRight')}</span>
          </Button>

          <Button
            variant={settings.alignment == 'justify' ? 'default' : 'outline'}
            size='sm'
            onClick={() =>
              updateSettings(
                'alignment',
                settings.alignment == 'justify' ? 'default' : 'justify'
              )
            }
            className='flex h-12 items-center justify-center gap-2 text-sm'
            aria-pressed={settings.alignment === 'justify'}
          >
            <AlignJustify className='h-4 w-4' />
            <span>{t('alignJustify')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
