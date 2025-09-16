'use client';
import {
  BrainCircuit,
  Eye,
  KeyboardIcon,
  Sparkles,
  Volume2Icon,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useRefStore } from '@/store/useRefStore';

type ProfileCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  profileName: string;
  disabled?: boolean;
};

// Profile Card Component
const ProfileCard: React.FC<ProfileCardProps> = ({
  icon,
  title,
  description,
  onClick,
  profileName,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col p-4 border rounded-lg transition-colors w-full text-left ${
        disabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
      } `}
      aria-disabled={disabled}
      aria-label={`Select ${title} profile`}
      id={`profile-${profileName}`}
    >
      <div className='flex items-center mb-2'>
        <span className='flex-shrink-0' aria-hidden='true'>
          {icon}
        </span>
        <h3 className='text-lg font-medium ml-2'>{title}</h3>
      </div>
      <p className='text-sm text-gray-600 dark:text-gray-300'>{description}</p>
    </button>
  );
};

type Props = {
  changeProfile: (key: string, value: boolean) => void;
};

const AccessibilityWelcomeModal = ({ changeProfile }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const t = useTranslations('Accessibility.welcome');
  const { updateSettings } = useAccessibilityStore();
  const clickButton = useRefStore((state) => state.clickButton);

  // Check if this is the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('accessibility-onboarding-shown');
    if (!hasVisited) {
      setOpen(true);
    }
  }, []);

  // Function to handle profile selection
  const handleProfileSelect = (profileName: string): void => {
    // Apply the profile
    updateSettings('profiles', profileName, true);
    localStorage.setItem('accessibility-onboarding-shown', 'true');
    changeProfile(profileName, true);
    // Close the modal
    setOpen(false);
  };

  // Function to skip profile selection
  const handleSkip = (): void => {
    setOpen(false);
    localStorage.setItem('accessibility-onboarding-shown', 'true');
  };

  const handleMore = () => {
    clickButton();
    setOpen(false);
    localStorage.setItem('accessibility-onboarding-shown', 'true');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl'>
            {t('title') || 'Welcome! Customize Your Experience'}
          </DialogTitle>
          <DialogDescription className='text-sm sm:text-base mt-2'>
            {t('description') ||
              'Please select an accessibility profile that suits your needs, or skip to use the default interface.'}
          </DialogDescription>
        </DialogHeader>

        <div
          className='grid grid-cols-1 sm:grid-cols-2 gap-4 py-4'
          role='group'
          aria-label='Accessibility profile options'
        >
          <ProfileCard
            icon={<Zap className='h-5 w-5 sm:h-6 sm:w-6 ' />}
            title={t('seizeSafe') || 'Seizure Safe'}
            description={
              t('seizeSafeDesc') || 'Eliminates flashes and reduces color'
            }
            onClick={() => handleProfileSelect('seizeSafe')}
            profileName='seizeSafe'
          />

          <ProfileCard
            icon={<Eye className='h-5 w-5 sm:h-6 sm:w-6 ' />}
            title={t('visionImpaired') || 'Vision Impaired'}
            description={t('visionImpairedDesc') || 'Enhances website visuals'}
            onClick={() => handleProfileSelect('visionImpaired')}
            profileName='visionImpaired'
          />

          <ProfileCard
            icon={<Sparkles className='h-5 w-5 sm:h-6 sm:w-6 ' />}
            title={t('adhd') || 'ADHD Friendly'}
            description={
              t('adhdDesc') || 'Reduces distractions and improves focus'
            }
            onClick={() => handleProfileSelect('adhd')}
            profileName='adhd'
          />

          <ProfileCard
            icon={<BrainCircuit className='h-5 w-5 sm:h-6 sm:w-6 ' />}
            title={t('cognitiveDisability') || 'Cognitive Disability'}
            description={
              t('cognitiveDisabilityDesc') ||
              'Assists with reading and focusing'
            }
            onClick={() => handleProfileSelect('cognitiveDisability')}
            profileName='cognitiveDisability'
          />

          <ProfileCard
            icon={
              <KeyboardIcon className='h-5 w-5 sm:grid-cols-2 sm:h-6 sm:w-6 ' />
            }
            title='Keyboard Navigation'
            description='Easy keyboard navigation with shortcut'
            onClick={() => handleProfileSelect('keyboardNavigation')}
            profileName='keyboardNavigation'
          />

          <ProfileCard
            icon={
              <Volume2Icon className='h-5 w-5 sm:grid-cols-2 sm:h-6 sm:w-6 ' />
            }
            title='Text-to-Speech (On Progress)'
            description='Transform any text to sound'
            disabled={true}
            onClick={() => {
              console.log('Coming Soon');
            }}
            // onClick
            profileName='textToSpeech'
          />
        </div>

        <DialogFooter className='flex flex-col sm:flex-col gap-3 mt-4'>
          <Button
            className='text-sm w-full sm:w-auto '
            onClick={handleMore}
            aria-label='Open detailed accessibility settings'
          >
            Open More Settings
          </Button>
          <Button
            variant='outline'
            onClick={handleSkip}
            className='w-full sm:w-auto '
            aria-label='Skip accessibility setup for now'
          >
            {t('skipButton') || 'Skip for now'}
          </Button>
          <div className='text-xs text-gray-500 mt-2 w-full'>
            {t('note') ||
              'You can change your accessibility settings anytime using the widget at the bottom right of the screen.'}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibilityWelcomeModal;
