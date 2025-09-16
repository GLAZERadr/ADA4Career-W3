import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useSaturation() {
  const saturationLevel = useAccessibilityStore(
    (state) => state.settings.colors.saturation
  );

  useEffect(() => {
    const htmlElement = document.querySelector('html');
    if (htmlElement) {
      switch (saturationLevel) {
        case 'default':
          htmlElement.style.filter = 'saturate(1)';
          break;
        case 'low':
          htmlElement.style.filter = 'saturate(0.5)';
          break;
        case 'high':
          htmlElement.style.filter = 'saturate(2)';
          break;
      }
    }
  }, [saturationLevel]);
}
