import { create } from 'zustand';
import { db } from '@/db/database';

/* ============================================
   Settings Store
   ============================================ */

interface SettingsState {
  currency: string;
  theme: 'light' | 'dark' | 'system';
  onboardingCompleted: boolean;
  exchangeRate: number; // How many IDR is 1 TWD
  exchangeRateLastUpdated: Date | null;
  isLoaded: boolean;

  loadSettings: () => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  completeOnboarding: () => Promise<void>;
  fetchExchangeRate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: 'TWD',
  theme: 'system',
  onboardingCompleted: false,
  exchangeRate: 490, // fallback
  exchangeRateLastUpdated: null,
  isLoaded: false,

  loadSettings: async () => {
    const settings = await db.settings.get('app_settings');
    if (settings) {
      set({
        currency: settings.currency,
        theme: settings.theme,
        onboardingCompleted: settings.onboardingCompleted,
        exchangeRate: settings.exchangeRate || 490,
        exchangeRateLastUpdated: settings.exchangeRateLastUpdated || null,
        isLoaded: true,
      });
      // Optionally trigger fetch in background if older than 1 day
      if (!settings.exchangeRateLastUpdated || new Date().getTime() - new Date(settings.exchangeRateLastUpdated).getTime() > 1000 * 60 * 60 * 24) {
        useSettingsStore.getState().fetchExchangeRate();
      }
    } else {
      set({ isLoaded: true });
    }
  },

  setCurrency: async (currency: string) => {
    await db.settings.update('app_settings', {
      currency,
      updatedAt: new Date(),
    });
    set({ currency });
  },

  setTheme: async (theme: 'light' | 'dark' | 'system') => {
    await db.settings.update('app_settings', {
      theme,
      updatedAt: new Date(),
    });
    set({ theme });
  },

  completeOnboarding: async () => {
    await db.settings.update('app_settings', {
      onboardingCompleted: true,
      updatedAt: new Date(),
    });
    set({ onboardingCompleted: true });
  },

  fetchExchangeRate: async () => {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/TWD');
      if (response.ok) {
        const data = await response.json();
        const idrRate = data.rates?.IDR;
        if (idrRate) {
          const now = new Date();
          await db.settings.update('app_settings', {
            exchangeRate: idrRate,
            exchangeRateLastUpdated: now,
            updatedAt: now,
          });
          set({ exchangeRate: idrRate, exchangeRateLastUpdated: now });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch exchange rate', e);
    }
  }
}));

/**
 * Apply theme to document based on settings
 */
export function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}
