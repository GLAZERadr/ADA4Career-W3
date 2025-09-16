import { RefObject } from 'react';
import { create } from 'zustand';

// Define your store types
type ElementRefs = {
  buttonRef: RefObject<HTMLButtonElement> | null;
  // Add other refs as needed
};

type RefActions = {
  setButtonRef: (ref: RefObject<HTMLButtonElement> | null) => void;
  clickButton: () => void;
  // Add other actions as needed
};

// Create the store
export const useRefStore = create<ElementRefs & RefActions>((set, get) => ({
  // Initial ref states
  buttonRef: null,

  // Actions to set refs
  setButtonRef: (ref) => set({ buttonRef: ref }),

  clickButton: () => {
    const { buttonRef } = get();
    if (buttonRef?.current) {
      buttonRef.current.click();
    }
  },
}));
