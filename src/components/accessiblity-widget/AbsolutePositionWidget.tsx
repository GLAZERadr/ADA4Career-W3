'use client';
import React from 'react';

import AccessibilityWidget from '@/components/AccessibilityWidget';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

const AbsolutePositionWidget = () => {
  const { position } = useAccessibilityStore();

  return (
    <div
      className={`fixed bottom-4 z-50 ${
        position === 'right' ? 'right-4 md:right-6' : 'left-4 md:left-4'
      }`}
    >
      <AccessibilityWidget />
    </div>
  );
};

export default AbsolutePositionWidget;
