import { useTranslations } from 'next-intl'; // Import useTranslations

export function AccessibilityHeader() {
  const t = useTranslations('Accessibility.widget'); // Add translation hook

  return (
    <div>
      <h2 id='accessibility-title' className='text-xl font-bold text-gray-900 '>
        {t('title')}
      </h2>
    </div>
  );
}
