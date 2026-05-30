import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { seedDefaultData } from '@/db/database';
import { useSettingsStore, applyTheme } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Inventory from '@/pages/Inventory';
import InventoryCategories from '@/pages/InventoryCategories';
import MoneyPlanner from '@/pages/MoneyPlanner';
import MoneyCategories from '@/pages/MoneyCategories';
import Budget from '@/pages/Budget';
import Savings from '@/pages/Savings';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Onboarding from '@/pages/Onboarding';

/* ============================================
   App Root
   ============================================ */

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { loadSettings, onboardingCompleted, theme } = useSettingsStore();
  const { user, isGuest, isLoading: isAuthLoading, checkSession } = useAuthStore();

  useEffect(() => {
    async function init() {
      await checkSession();
      await seedDefaultData();
      await loadSettings();
      setIsReady(true);
    }
    init();
  }, [loadSettings, checkSession]);

  useEffect(() => {
    if (isReady) {
      applyTheme(theme);
    }
  }, [isReady, theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (useSettingsStore.getState().theme === 'system') {
        applyTheme('system');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isReady || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <div className="flex flex-col items-center gap-4 animate-[fade-in_0.5s_ease-out]">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        {!user && !isGuest && (
          <Route path="*" element={<Login />} />
        )}

        {/* Onboarding */}
        {(user || isGuest) && !onboardingCompleted && (
          <Route path="*" element={<Onboarding />} />
        )}

        {/* Main app */}
        {(user || isGuest) && onboardingCompleted && (
          <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/categories" element={<InventoryCategories />} />
          <Route path="/money" element={<MoneyPlanner />} />
          <Route path="/money/categories" element={<MoneyCategories />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
