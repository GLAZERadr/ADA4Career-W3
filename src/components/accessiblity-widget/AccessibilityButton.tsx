import { Accessibility } from 'lucide-react';
import { useTranslations } from 'next-intl'; // Import useTranslations

type AccessibilityButtonProps = {
  onClick: () => void;
};

export function AccessibilityButton({ onClick }: AccessibilityButtonProps) {
  const t = useTranslations('Accessibility.widget'); // Add translation hook

  return (
    <button
      onClick={onClick}
      className='fixed bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
      aria-label={t('openSettings')}
    >
      <Accessibility className='h-6 w-6' />
    </button>
  );
}
