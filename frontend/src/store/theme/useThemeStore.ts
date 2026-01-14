import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SupportedTheme } from '@/config/themes';
import { getInitialTheme, themeActions } from './utils';

interface ThemeState {
  theme: SupportedTheme;
  setTheme: (theme: SupportedTheme) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      setTheme: themeActions.setTheme(set),
      resetTheme: themeActions.resetTheme(set),
    }),
    {
      name: 'theme-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Selectors để hạn chế re-render không cần thiết
export const useCurrentTheme = () => useThemeStore((state) => state.theme);
export const useSetTheme = () => useThemeStore((state) => state.setTheme);
export const useResetTheme = () => useThemeStore((state) => state.resetTheme);
