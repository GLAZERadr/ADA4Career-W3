import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useHighlightTitles() {
  const highlightTitles = useAccessibilityStore(
    (state) => state.settings.content.highlightTitles
  );

  useEffect(() => {
    const headingElements = document.querySelectorAll<HTMLElement>(
      'h1, h2, h3, h4, h5, h6'
    );

    // Reset all heading styles before applying new ones
    headingElements.forEach((el) => {
      el.style.backgroundColor = '';
      el.style.color = ''; // Reset text color as well
      el.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    });

    if (highlightTitles) {
      headingElements.forEach((el) => {
        el.style.backgroundColor = '#FFFF00'; // Yellow background
        el.style.color = '#000000'; // Force black text for contrast
      });
    }
  }, [highlightTitles]);
}
