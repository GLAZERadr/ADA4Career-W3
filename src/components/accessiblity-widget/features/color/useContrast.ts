import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useContrastMode() {
  const contrastMode = useAccessibilityStore(
    (state) => state.settings.colors.contrast
  );

  useEffect(() => {
    const htmlElement = document.querySelector('html');
    const bodyElement = document.body;
    if (!htmlElement || !bodyElement) return;

    // Reset styles before applying new contrast mode
    htmlElement.style.filter = '';
    htmlElement.style.backgroundColor = '';
    htmlElement.style.color = '';
    bodyElement.style.backgroundColor = '';
    bodyElement.style.color = '';
    htmlElement.style.transition = 'all 0.3s ease';

    const textElements = document.querySelectorAll<HTMLElement>(
      'p, h1, h2, h3, h4, h5, h6, span, a, li'
    );

    switch (contrastMode) {
      case 'dark':
        htmlElement.style.backgroundColor = '#000000';
        htmlElement.style.color = '#FFFFFF';
        bodyElement.style.backgroundColor = '#000000';
        bodyElement.style.color = '#FFFFFF';
        textElements.forEach((el) => {
          el.style.backgroundColor = '#000000';
          el.style.color = '#FFFFFF';
        });
        break;

      case 'light':
        htmlElement.style.backgroundColor = '#FFFFFF';
        htmlElement.style.color = '#000000';
        bodyElement.style.backgroundColor = '#FFFFFF';
        bodyElement.style.color = '#000000';
        textElements.forEach((el) => {
          el.style.backgroundColor = '#FFFFFF';
          el.style.color = '#000000';
        });
        break;

      case 'high':
        htmlElement.style.filter = 'contrast(300%)';
        break;

      case 'default':
      default:
        htmlElement.style.filter = 'contrast(100%)';
        htmlElement.style.backgroundColor = '';
        htmlElement.style.color = '';
        bodyElement.style.backgroundColor = '';
        bodyElement.style.color = '';
        textElements.forEach((el) => {
          el.style.backgroundColor = '';
          el.style.color = '';
        });
        break;
    }
  }, [contrastMode]);
}
