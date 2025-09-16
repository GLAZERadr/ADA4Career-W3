import { useTranslations } from 'next-intl'; // Import useTranslations

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

type ProfileSettingsProps = {
  settings: {
    seizeSafe: boolean;
    visionImpaired: boolean;
    adhd: boolean;
    cognitiveDisability: boolean;
    keyboardNavigation: boolean;
  };
  updateSettings: (key: string, value: boolean) => void;
};

export function ProfileSettings({
  settings,
  updateSettings,
}: ProfileSettingsProps) {
  const t = useTranslations('Accessibility.profiles'); // Add translation hook

  const handleProfileChange = (profileName: string, isActive: boolean) => {
    // If activating a profile, deactivate all others
    if (isActive) {
      Object.keys(settings).forEach((key) => {
        if (key !== profileName) {
          updateSettings(key, false);
        }
      });
    }
    // Update the selected profile
    updateSettings(profileName, isActive);
  };

  return (
    <div className='space-y-4 rounded-lg bg-gray-50'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <Label htmlFor='seize-safe' className='text-base font-medium'>
            {t('seizeSafe')}
          </Label>
        </div>
        <Switch
          id='seize-safe'
          checked={settings.seizeSafe}
          onCheckedChange={(checked) =>
            handleProfileChange('seizeSafe', checked)
          }
          aria-describedby='seize-safe-description'
        />
      </div>
      <Separator />

      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <Label htmlFor='vision-impaired' className='text-base font-medium'>
            {t('visionImpaired')}
          </Label>
        </div>
        <Switch
          id='vision-impaired'
          checked={settings.visionImpaired}
          onCheckedChange={(checked) =>
            handleProfileChange('visionImpaired', checked)
          }
          aria-describedby='vision-impaired-description'
        />
      </div>
      <Separator />

      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <Label htmlFor='adhd' className='text-base font-medium '>
            {t('adhd')}
          </Label>
        </div>
        <Switch
          id='adhd'
          checked={settings.adhd}
          onCheckedChange={(checked) => handleProfileChange('adhd', checked)}
          aria-describedby='adhd-description'
          className='data-[state=checked]:bg-purple-600'
        />
      </div>
      <Separator />

      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <Label
            htmlFor='cognitive-disability'
            className='text-base font-medium'
          >
            {t('cognitiveDisability')}
          </Label>
        </div>
        <Switch
          id='cognitive-disability'
          checked={settings.cognitiveDisability}
          onCheckedChange={(checked) =>
            handleProfileChange('cognitiveDisability', checked)
          }
          aria-describedby='cognitive-disability-description'
        />
      </div>
      <Separator />

      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <Label
            htmlFor='keyboard-navigation'
            className='text-base font-medium'
          >
            Keyboard Navigation
          </Label>
        </div>
        <Switch
          id='keyboard-navigation'
          checked={settings.keyboardNavigation}
          onCheckedChange={(checked) =>
            handleProfileChange('keyboardNavigation', checked)
          }
          aria-describedby='keyboard-navigation-description'
        />
      </div>
      <Separator />
    </div>
  );
}
