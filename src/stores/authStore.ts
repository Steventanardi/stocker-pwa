import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  
  // Actions
  setGuestMode: () => void;
  signInWithEmail: (email: string) => Promise<{ error: any }>;
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

  signInWithEmail: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
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
