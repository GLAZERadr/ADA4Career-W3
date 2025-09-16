import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useMuteSound() {
  const muteSound = useAccessibilityStore(
    (state) => state.settings.orientation.muteSounds
  );

  useEffect(() => {
    const mediaElements = document.querySelectorAll('audio, video');
    mediaElements.forEach((element) => {
      if (element instanceof HTMLMediaElement) {
        element.muted = muteSound;
      }
    });
  }, [muteSound]);
}
