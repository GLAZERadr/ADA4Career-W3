import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useHighlightHover() {
  const highlightHover = useAccessibilityStore(
    (state) => state.settings.content.highlightHover
  );

  useEffect(() => {
    // Target interactive elements
    const interactiveElements = document.querySelectorAll<HTMLElement>(
      'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
    );

    // Remove any existing hover styles
    const styleId = 'accessibility-hover-styles';
    const existingStyleElement = document.getElementById(styleId);
    if (existingStyleElement) {
      existingStyleElement.remove();
    }

    if (highlightHover) {
      // Create a style element for hover effects
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        a:hover, button:hover, input:hover, select:hover, textarea:hover, 
        [role="button"]:hover, [tabindex]:not([tabindex="-1"]):hover {
          outline: 3px solid #FFFF00 !important;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3) !important;
          transition: outline 0.2s ease, box-shadow 0.2s ease !important;
        }
      `;
      document.head.appendChild(styleElement);

      // Add a data attribute to mark elements for easier selection
      interactiveElements.forEach((el) => {
        el.setAttribute('data-accessibility-hover', 'true');
      });
    } else {
      // Remove the data attribute when feature is disabled
      interactiveElements.forEach((el) => {
        el.removeAttribute('data-accessibility-hover');
      });
    }

    // Cleanup function
    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [highlightHover]);
}
