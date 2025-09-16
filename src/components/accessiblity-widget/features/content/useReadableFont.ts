import { useEffect } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useReadableFont() {
  const readableFont = useAccessibilityStore(
    (state) => state.settings.content.readableFont
  );

  useEffect(() => {
    const htmlElement = document.querySelector('html');
    if (!htmlElement) return;

    // Store original font-family to restore it later
    if (
      !htmlElement.hasAttribute('data-original-font-family') &&
      htmlElement.style.fontFamily
    ) {
      htmlElement.setAttribute(
        'data-original-font-family',
        htmlElement.style.fontFamily
      );
    }

    const styleId = 'accessibility-readable-font-styles';
    const existingStyleElement = document.getElementById(styleId);

    if (existingStyleElement) {
      existingStyleElement.remove();
    }

    if (readableFont) {
      // Create a style element for readable fonts
      const styleElement = document.createElement('style');
      styleElement.id = styleId;

      // Set of highly readable fonts with fallbacks
      styleElement.textContent = `
        body, p, h1, h2, h3, h4, h5, h6, span, a, button, input, select, textarea, li, td, th {
          font-family: 'Arial', 'Verdana', sans-serif !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
          line-height: 1.5 !important;
        }
      `;
      document.head.appendChild(styleElement);

      // Add additional styling for better reading experience
      htmlElement.style.fontWeight = '600';
    } else {
      // Restore original font settings
      htmlElement.style.fontWeight = '';

      // Restore original font-family if it was stored
      const originalFontFamily = htmlElement.getAttribute(
        'data-original-font-family'
      );
      if (originalFontFamily) {
        htmlElement.style.fontFamily = originalFontFamily;
      }
    }

    // Cleanup function
    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [readableFont]);
}
