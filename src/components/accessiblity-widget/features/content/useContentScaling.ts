import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useContentScaling() {
  const contentScaling = useAccessibilityStore(
    (state) => state.settings.content.contentScaling
  );

  useEffect(() => {
    const htmlElement = document.querySelector('html');
    if (!htmlElement) return;

    switch (contentScaling) {
      case 'large':
        htmlElement.style.fontSize = '125%';
        break;
      case 'larger':
        htmlElement.style.fontSize = '150%';
        break;
      case 'default':
      default:
        htmlElement.style.fontSize = '100%';
        break;
    }
  }, [contentScaling]);
}
