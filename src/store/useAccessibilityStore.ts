import type React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  AccessibilitySettings,
  profilePresets,
} from '@/components/AccessibilityWidget';

/**
 * Accessibility store type definition
 */
type AccessibilityStore = {
  settings: AccessibilitySettings;
  position: 'right' | 'left';
  togglePostion: () => void;
  updateSettings: (
    category: keyof AccessibilitySettings,
    subcategory: string,
    value: any
  ) => void;
  applyProfile: (profileName: keyof typeof profilePresets) => void;
  applyAccessibilityStyles: () => React.CSSProperties;
  resetSettings: () => void;
  hasOnboarded: boolean;
  setHasOnboarded: (value: boolean) => void;
  openKeyboardDialog: boolean;
  toggleOpenKeyboardDialog: () => void;
};

/**
 * Default accessibility settings
 */
const defaultSettings: AccessibilitySettings = {
  profiles: {
    seizeSafe: false,
    visionImpaired: false,
    adhd: false,
    cognitiveDisability: false,
    keyboardNavigation: false,
  },
  orientation: {
    muteSounds: false,
    hideImages: false,
    readMode: false,
    readingGuide: false,
    readingMask: false,
    highlightHover: false,
    highlightFocus: false,
    cursor: 'default',
    stopAnimations: false,
  },
  colors: {
    contrast: 'default',
    saturation: 'default',
    monochrome: false,
    textColor: '#000000',
    titleColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  content: {
    contentScaling: 'default',
    readableFont: false,
    highlightTitles: false,
    highlightLinks: false,
    highlightHover: false,
    fontSize: 'default',
    lineHeight: 'default',
    letterSpacing: 'default',
    keyboardNavigation: false,
    alignment: 'default',
  },
};

/**
 * Zustand store for managing accessibility settings
 */
export const useAccessibilityStore = create<AccessibilityStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      hasOnboarded: false,
      position: 'right',
      openKeyboardDialog: false,

      toggleOpenKeyboardDialog: () =>
        set((state) => ({
          openKeyboardDialog: !state.openKeyboardDialog,
        })),

      togglePostion: () =>
        set((state) => ({
          position: state.position === 'right' ? 'left' : 'right',
        })),

      setHasOnboarded: (value) =>
        set(() => ({
          hasOnboarded: value,
        })),

      resetSettings: () =>
        set(() => ({
          settings: defaultSettings,
        })),

      /**
       * Updates a specific setting in the store
       */
      updateSettings: (category, subcategory, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [category]: {
              ...state.settings[category],
              [subcategory]: value,
            },
          },
        })),

      /**
       * Applies a predefined accessibility profile
       */
      applyProfile: (profileName) => {
        set((state) => {
          // First, update the profile toggle
          const updatedProfiles = {
            ...state.settings.profiles,
            [profileName]: true,
          };

          // Get the preset values
          const preset = profilePresets[profileName];

          // Apply all preset settings
          return {
            settings: {
              ...state.settings,
              profiles: updatedProfiles,
              ...(preset as Omit<AccessibilitySettings, 'profiles'>),
            },
          };
        });
      },

      /**
       * Generates and applies accessibility-related CSS styles
       */
      applyAccessibilityStyles: () => {
        const { settings } = get();
        const styles: React.CSSProperties = {};

        // Add code to apply styles based on settings
        // Font Size
        if (settings.content.fontSize === 'large') {
          styles.fontSize = '1.1rem';
        } else if (settings.content.fontSize === 'larger') {
          styles.fontSize = '1.25rem';
        }

        // Line Height
        if (settings.content.lineHeight === 'large') {
          styles.lineHeight = '1.8';
        } else if (settings.content.lineHeight === 'larger') {
          styles.lineHeight = '2.2';
        }

        // Letter Spacing
        if (settings.content.letterSpacing === 'large') {
          styles.letterSpacing = '0.05em';
        } else if (settings.content.letterSpacing === 'larger') {
          styles.letterSpacing = '0.1em';
        }

        // Text Alignment
        if (settings.content.alignment !== 'default') {
          styles.textAlign = settings.content.alignment;
        }

        // Contrast settings
        if (settings.colors.contrast === 'high') {
          styles.color = '#000000';
          styles.backgroundColor = '#FFFFFF';
        } else if (settings.colors.contrast === 'dark') {
          styles.backgroundColor = '#000000';
          styles.color = '#FFFFFF';
        } else if (settings.colors.contrast === 'light') {
          styles.backgroundColor = '#FFFFFF';
          styles.color = '#000000';
        }

        // Saturation & Monochrome
        if (settings.colors.saturation === 'high') {
          styles.filter = 'saturate(200%)';
        } else if (settings.colors.saturation === 'low') {
          styles.filter = 'saturate(50%)';
        } else if (settings.colors.monochrome) {
          styles.filter = 'grayscale(100%)';
        }

        // Readable Font
        if (settings.content.readableFont) {
          styles.fontFamily = "'Arial', 'Helvetica', sans-serif";
        }

        // Hide Images
        if (settings.orientation.hideImages) {
          styles.visibility = 'hidden';
        }

        // Stop Animations
        if (settings.orientation.stopAnimations) {
          styles.animation = 'none';
          styles.transition = 'none';
        }

        return styles;
      },
    }),
    {
      name: 'accessibility-storage',
      partialize: (state) => ({
        settings: state.settings,
        hasOnboarded: state.hasOnboarded,
      }),
    }
  )
);
