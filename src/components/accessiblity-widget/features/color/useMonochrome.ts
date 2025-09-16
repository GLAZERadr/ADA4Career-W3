import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useMonochrome() {
  const monochromeMode = useAccessibilityStore(
    (state) => state.settings.colors.monochrome
  );

  useEffect(() => {
    document.documentElement.style.filter = monochromeMode
      ? 'grayscale(100%)'
      : '';
  }, [monochromeMode]);
}
