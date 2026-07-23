import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { secureStorage } from '@/lib/secure-storage';
import type { TokenPair, User } from '@/types/api';

interface PendingVerification {
  token: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  hasHydrated: boolean;
  /** Set by signup and by an unverified login — holds the short-lived
   * pending_token driving the verify-email OTP step, never a real session. */
  pendingVerification: PendingVerification | null;
  setSession: (tokens: TokenPair, user?: User) => void;
  setUser: (user: User) => void;
  setHasHydrated: (value: boolean) => void;
  clearSession: () => void;
  setPendingVerification: (pending: PendingVerification) => void;
  clearPendingVerification: () => void;
}

/** Ported from New Turn/frontend/store/auth-store.ts — same shape, same
 * setSession/clearSession contract the shared services layer expects.
 * Storage swaps localStorage for expo-secure-store (see lib/secure-storage.ts);
 * everything else is unchanged. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      pendingVerification: null,
      setSession: (tokens, user) =>
        set((state) => ({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          user: user ?? state.user,
        })),
      setUser: (user) => set({ user }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
      setPendingVerification: (pending) => set({ pendingVerification: pending }),
      clearPendingVerification: () => set({ pendingVerification: null }),
    }),
    {
      name: 'newturn-auth',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        pendingVerification: state.pendingVerification,
      }),
    },
  ),
);
