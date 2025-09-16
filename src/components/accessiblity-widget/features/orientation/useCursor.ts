import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useCursor() {
  const state = useAccessibilityStore(
    (state) => state.settings.orientation.cursor
  );

  useEffect(() => {
    if (state === 'black') {
      document.body.style.cursor =
        'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="black" d="M5.5 1.5l4.5 4.5 4.5 4.5-4.5 4.5-4.5-4.5 4.5-4.5-4.5-4.5z"/></svg>\'), auto';
    } else if (state === 'white') {
      document.body.style.cursor =
        'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="white" stroke="black" d="M5.5 1.5l4.5 4.5 4.5 4.5-4.5 4.5-4.5-4.5 4.5-4.5-4.5-4.5z"/></svg>\'), auto';
    } else {
      document.body.style.cursor = '';
    }
  }, [state]);
}
