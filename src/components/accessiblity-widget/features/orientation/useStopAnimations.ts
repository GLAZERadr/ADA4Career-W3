import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useStopAnimations() {
  const state = useAccessibilityStore(
    (state) => state.settings.orientation.cursor
  );

  useEffect(() => {
    // Stop animations if needed
    if (state) {
      const style = document.createElement('style');
      style.id = 'stop-animations';
      style.innerHTML =
        '* { animation: none !important; transition: none !important; }';
      document.head.appendChild(style);
    } else {
      const existingStyle = document.getElementById('stop-animations');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [state]);
}
