import React from 'react';

import { useAccessibilityStore } from '@/store/useAccessibilityStore';

const PositionToggle = () => {
  const { position, togglePostion } = useAccessibilityStore();

  return (
    <div className='w-full max-w-sm'>
      <div className='flex flex-col space-y-1.5'>
        <div className='flex border rounded-md overflow-hidden'>
          <button
            onClick={() => {
              if (position === 'right') {
                togglePostion();
              }
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              position === 'left'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted'
            }`}
            type='button'
          >
            <span>←</span>
            <span>Move to Left</span>
          </button>
          <button
            onClick={() => {
              if (position === 'left') {
                togglePostion();
              }
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              position === 'right'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted'
            }`}
            type='button'
          >
            <span>Move to Right</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PositionToggle;
