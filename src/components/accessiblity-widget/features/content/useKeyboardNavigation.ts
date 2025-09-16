/* eslint-disable no-case-declarations */
import { useEffect, useRef } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useKeyboardNavigation() {
  const keyboardNavigationEnabled = useAccessibilityStore(
    (state) => state.settings.profiles.keyboardNavigation ?? false
  );

  const toggleDialog = useAccessibilityStore(
    (state) => state.toggleOpenKeyboardDialog
  );

  // Refs to track navigation state
  const announcementRef = useRef<HTMLDivElement | null>(null);
  const lastKeyPressedRef = useRef<string | null>(null);
  const currentIndexRef = useRef<number>(0);
  const elementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!keyboardNavigationEnabled) return;

    toggleDialog();

    // Create an announcement element for screen readers
    if (!announcementRef.current) {
      const element = document.createElement('div');
      element.setAttribute('aria-live', 'assertive');
      element.setAttribute('class', 'sr-only');
      element.setAttribute('id', 'keyboard-nav-announcement');
      document.body.appendChild(element);
      announcementRef.current = element;
    }

    // Function to announce messages to screen readers
    const announce = (message: string) => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
        // Clear announcement after 2 seconds
        setTimeout(() => {
          if (announcementRef.current) {
            announcementRef.current.textContent = '';
          }
        }, 2000);
      }
    };

    // Get elements based on the key pressed
    const getElementsForKey = (key: string): HTMLElement[] => {
      let elements: NodeListOf<HTMLElement> | null = null;

      switch (key.toUpperCase()) {
        case 'M': // Menus
          elements = document.querySelectorAll(
            'nav a, nav button, [role="menu"] [role="menuitem"], .menu, .menu-item'
          );
          break;

        case 'H': // Headings - Make sure these are focusable
          const headings = document.querySelectorAll(
            `h1, h2, h3, h4, h5, h6, [role="heading"]`
          );
          // Make headings programmatically focusable by setting tabindex if needed
          headings.forEach((heading) => {
            if (!heading.hasAttribute('tabindex')) {
              heading.setAttribute('tabindex', '-1'); // -1 means focusable but not in tab order
            }
          });
          elements = headings as NodeListOf<HTMLElement>;
          break;

        case 'F': // Forms
          elements = document.querySelectorAll(
            'form, input:not([type="hidden"]), select, textarea, button[type="submit"], [role="form"]'
          );
          break;

        case 'B': // Buttons
          elements = document.querySelectorAll(
            'button, [role="button"], input[type="button"], input[type="submit"]'
          );
          break;

        case 'G': // Graphics - Make sure these are focusable
          const graphics = document.querySelectorAll(
            'img, svg, canvas, [role="img"], figure'
          );
          // Make graphics programmatically focusable by setting tabindex if needed
          graphics.forEach((graphic) => {
            if (!graphic.hasAttribute('tabindex')) {
              graphic.setAttribute('tabindex', '-1'); // -1 means focusable but not in tab order
            }

            // Ensure images have alt text for accessibility
            if (graphic.tagName === 'IMG' && !graphic.hasAttribute('alt')) {
              graphic.setAttribute('alt', 'Image'); // Default alt text
            }
          });
          elements = graphics as NodeListOf<HTMLElement>;
          break;
      }

      // Convert NodeList to Array and filter out elements that may be hidden or not focusable
      const elementArray = elements ? Array.from(elements) : [];
      return elementArray.filter((element) => {
        // Check if element is visible
        const style = window.getComputedStyle(element);
        const isVisible =
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0';

        // // Check if it's within the viewport (roughly)
        // const rect = element.getBoundingClientRect();
        // const isInViewport =
        //   rect.width > 0 &&
        //   rect.height > 0 &&
        //   rect.top < window.innerHeight &&
        //   rect.left < window.innerWidth;

        return isVisible;
      });
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if in editable fields
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      // Skip if modifier keys are pressed (except Shift for Shift+Tab)
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      const key = event.key.toUpperCase();

      // Check if the key is one of our navigation keys
      if (['M', 'H', 'F', 'B', 'G'].includes(key)) {
        // Get elements for this key
        const elements = getElementsForKey(key);

        if (elements.length === 0) {
          announce(`No ${getElementTypeNameForKey(key)} found on this page`);
          return;
        }

        // For debugging - log what we found
        // console.log(
        //   `Found ${elements.length} ${getElementTypeNameForKey(key)}:`,
        //   elements
        // );

        // Determine if we're cycling through elements or starting fresh
        if (lastKeyPressedRef.current === key) {
          currentIndexRef.current =
            (currentIndexRef.current + 1) % elements.length;
        } else {
          // Different key pressed - reset to first element
          currentIndexRef.current = 0;
          elementsRef.current = elements;
          lastKeyPressedRef.current = key;
        }

        // Focus the element at the current index
        const element = elements[currentIndexRef.current];
        if (element) {
          try {
            // Add a highlight effect temporarily for visual feedback
            const originalOutline = element.style.outline;
            const originalBoxShadow = element.style.boxShadow;

            element.style.outline = '2px solid #4299e1';
            element.style.boxShadow = '0 0 0 4px rgba(66, 153, 225, 0.5)';

            // Focus the element
            element.focus();

            // Scroll element into view if needed
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Remove highlight after a short delay
            element.style.outline = originalOutline;
            element.style.boxShadow = originalBoxShadow;

            event.preventDefault();

            // Provide contextual announcement
            const count = elements.length;
            const position = currentIndexRef.current + 1;
            announce(
              `${getElementTypeNameForKey(
                key
              )} ${position} of ${count}: ${getElementDescription(element)}`
            );
          } catch (err) {
            console.error('Error focusing element:', err);
            announce(
              `Error focusing ${getElementTypeNameForKey(
                key
              )}. Please try again.`
            );
          }
        }
      }
    };

    // Helper function to get a friendly name for the element type
    const getElementTypeNameForKey = (key: string): string => {
      switch (key) {
        case 'M':
          return 'menus';
        case 'H':
          return 'headings';
        case 'F':
          return 'form elements';
        case 'B':
          return 'buttons';
        case 'G':
          return 'graphics';
        default:
          return 'elements';
      }
    };

    // Helper function to get a description of the element for announcements
    const getElementDescription = (element: HTMLElement): string => {
      // For headings, include the text content
      if (/^H[1-6]$/.test(element.tagName)) {
        return element.textContent || '';
      }

      // For buttons and links, use the text content or aria-label
      if (element.tagName === 'BUTTON' || element.tagName === 'A') {
        return element.getAttribute('aria-label') || element.textContent || '';
      }

      // For images, use the alt text or aria-label
      if (element.tagName === 'IMG') {
        return (
          element.getAttribute('alt') ||
          element.getAttribute('aria-label') ||
          'Image'
        );
      }

      // For inputs and other form elements, use the label or placeholder
      if (
        element.tagName === 'INPUT' ||
        element.tagName === 'SELECT' ||
        element.tagName === 'TEXTAREA'
      ) {
        const id = element.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) {
            return label.textContent || '';
          }
        }
        return (
          element.getAttribute('placeholder') ||
          element.getAttribute('aria-label') ||
          ''
        );
      }

      // Default to element tag name if no better description is available
      return (
        element.getAttribute('aria-label') ||
        element.textContent ||
        element.tagName.toLowerCase()
      );
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
        announcementRef.current = null;
      }
    };
  }, [keyboardNavigationEnabled]);

  // Return nothing, this is just a hook
  return null;
}
