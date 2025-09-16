import { useEffect, useRef } from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useReadMode() {
  const focusRead = useAccessibilityStore(
    (state) => state.settings.orientation.readMode
  );

  const topOverlayRef = useRef<HTMLDivElement | null>(null);
  const bottomOverlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isActive = false;

    // Function must be declared at the top level
    const updateOverlayPositions = (e: MouseEvent) => {
      if (isActive && topOverlayRef.current && bottomOverlayRef.current) {
        const lineHeight = 60;
        const y = e.clientY;
        topOverlayRef.current.style.height = `${Math.max(
          0,
          y - lineHeight / 2
        )}px`;
        bottomOverlayRef.current.style.height = `${Math.max(
          0,
          window.innerHeight - y - lineHeight / 2
        )}px`;
      }
    };

    if (focusRead) {
      if (!topOverlayRef.current) {
        topOverlayRef.current = document.createElement('div');
        topOverlayRef.current.style.cssText = `
          position: fixed;
          left: 0;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 9999;
          pointer-events: none;
          transition: height 0.1s ease;
          top: 0;
        `;
      }
      if (!bottomOverlayRef.current) {
        bottomOverlayRef.current = document.createElement('div');
        bottomOverlayRef.current.style.cssText = `
          position: fixed;
          left: 0;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 9999;
          pointer-events: none;
          transition: height 0.1s ease;
          bottom: 0;
        `;
      }

      document.body.appendChild(topOverlayRef.current);
      document.body.appendChild(bottomOverlayRef.current);
      isActive = true;

      document.addEventListener('mousemove', updateOverlayPositions);
      updateOverlayPositions({ clientY: window.innerHeight / 2 } as MouseEvent);
    }

    return () => {
      document.removeEventListener('mousemove', updateOverlayPositions);

      if (topOverlayRef.current?.parentNode) {
        topOverlayRef.current.parentNode.removeChild(topOverlayRef.current);
      }
      if (bottomOverlayRef.current?.parentNode) {
        bottomOverlayRef.current.parentNode.removeChild(
          bottomOverlayRef.current
        );
      }
    };
  }, [focusRead]);
}
