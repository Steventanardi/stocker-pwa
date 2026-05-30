import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  
  // Actions
  setGuestMode: () => void;
  signInWithPIN: (pin: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: localStorage.getItem('stocker_guest_mode') === 'true',
  isLoading: true,

  setGuestMode: () => {
    localStorage.setItem('stocker_guest_mode', 'true');
    set({ isGuest: true, user: null, isLoading: false });
  },

  signInWithPIN: async (pin: string) => {
    if (!pin || pin.length < 4) {
      return { error: new Error('PIN must be at least 4 characters') };
    }

    const email = 'admin@stocker.local';
    const password = `${pin}-stocker-secure-pad`;

    // 1. Try to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error && error.message.includes('Invalid login credentials')) {
      // 2. If invalid credentials, attempt to sign up (first time setup)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          // If already registered, it means they just typed the wrong PIN
          return { error: new Error('Incorrect PIN. Please try again.') };
        }
        return { error: signUpError };
      }
      return { error: null };
    }

    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('stocker_guest_mode');
    set({ user: null, isGuest: false });
  },

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ user: session.user, isGuest: false, isLoading: false });
      } else {
        const isGuest = localStorage.getItem('stocker_guest_mode') === 'true';
        set({ user: null, isGuest, isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          localStorage.removeItem('stocker_guest_mode');
          set({ user: session.user, isGuest: false });
        } else {
          set({ user: null });
        }
      });
    } catch (error) {
      console.error('Error checking auth session:', error);
      set({ isLoading: false });
    }
  },
}));
