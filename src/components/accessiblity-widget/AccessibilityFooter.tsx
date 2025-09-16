import { useTranslations } from 'next-intl'; // Import useTranslations

import PositionToggle from '@/components/accessiblity-widget/PositionToggle';
import { Button } from '@/components/ui/button';

export function AccessibilityFooter() {
  const t = useTranslations('Accessibility.widget'); // Add translation hook

  return (
    <div className='mt-4 text-center'>
      <div className='flex items-center justify-center p-3 rounded'>
        <PositionToggle />
      </div>

      <Button
        variant='link'
        className='text-xs text-blue-600 hover:text-blue-800'
      >
        {t('readGuidelines')}
      </Button>
    </div>
  );
}
