import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useTextAlignment() {
  const textAlignment = useAccessibilityStore(
    (state) => state.settings.content.alignment
  );

  useEffect(() => {
    const bodyElement = document.body;
    const allElements = document.getElementsByTagName('*');

    function applyAlignment(alignment: string) {
      bodyElement.style.setProperty('text-align', alignment, 'important');
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i] as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const originalAlign =
          element.getAttribute('data-original-align') ||
          computedStyle.textAlign;

        if (!element.hasAttribute('data-original-align')) {
          element.setAttribute('data-original-align', originalAlign);
        }

        element.style.setProperty('text-align', alignment, 'important');
      }
    }

    function resetAlignment() {
      bodyElement.style.removeProperty('text-align');
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i] as HTMLElement;
        const originalAlign = element.getAttribute('data-original-align');
        if (originalAlign) {
          element.style.textAlign = originalAlign;
          element.removeAttribute('data-original-align');
        } else {
          element.style.removeProperty('text-align');
        }
      }
    }

    if (textAlignment === 'default') {
      resetAlignment();
    } else {
      applyAlignment(textAlignment);
    }
  }, [textAlignment]);
}
