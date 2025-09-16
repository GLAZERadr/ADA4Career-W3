import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useHideImages() {
  const hideImages = useAccessibilityStore(
    (state) => state.settings.orientation.hideImages
  );

  useEffect(() => {
    const elements = document.querySelectorAll('img, picture, video');
    elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.style.display = hideImages ? 'none' : '';
      }
    });
  }, [hideImages]);
}
