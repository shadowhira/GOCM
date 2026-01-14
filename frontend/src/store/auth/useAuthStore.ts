import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserResponse } from "@/types/auth";
import { cookieUtils } from "@/lib/cookies";
import { clearUserStorage } from "@/lib/storage";

/**
 * Auth store following Zustand pattern from ARCHITECTURE_STANDARDS.md
 * Following pattern from store/locale/useLocaleStore.ts
 */

interface AuthState {
  // State
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (user: UserResponse, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<UserResponse>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      // Actions
      setAuth: (user: UserResponse, token: string) => {
        // Save token to cookies
        cookieUtils.setToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        // Remove token from cookies
        cookieUtils.removeToken();
        // Clear all user-specific localStorage data
        clearUserStorage();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData: Partial<UserResponse>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        // Don't persist token in localStorage anymore (only in cookies)
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      }
    }
  )
);

// Selectors to avoid unnecessary re-renders
export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useAuthToken = () => {
  // Get token from cookies instead of store state
  // This ensures we always get the latest token from cookies
  if (typeof window !== 'undefined') {
    return cookieUtils.getToken();
  }
  return null;
};
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useSetAuth = () => useAuthStore((state) => state.setAuth);
export const useClearAuth = () => useAuthStore((state) => state.clearAuth);
export const useUpdateUser = () => useAuthStore((state) => state.updateUser);
