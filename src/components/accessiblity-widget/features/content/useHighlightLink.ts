import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useLinkHighlight() {
  const linkHighlight = useAccessibilityStore(
    (state) => state.settings.content.highlightLinks
  );

  useEffect(() => {
    const links = document.querySelectorAll('a');
    links.forEach((link) => {
      if (link instanceof HTMLElement) {
        if (linkHighlight) {
          link.style.backgroundColor = 'yellow';
          link.style.color = 'black';
          link.style.textDecoration = 'underline';
          link.style.padding = '2px 4px';
          link.style.borderRadius = '3px';
        } else {
          link.style.backgroundColor = '';
          link.style.color = '';
          link.style.textDecoration = '';
          link.style.padding = '';
          link.style.borderRadius = '';
        }
      }
    });
  }, [linkHighlight]);
}
