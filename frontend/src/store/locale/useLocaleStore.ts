import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SupportedLocale } from '@/config/locales';
import { getInitialLocale, localeActions } from './utils';

interface LocaleState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  resetLocale: () => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: getInitialLocale(),
      setLocale: localeActions.setLocale(set),
      resetLocale: localeActions.resetLocale(set),
    }),
    {
      name: 'locale-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);

// Selectors để hạn chế re-render không cần thiết
export const useCurrentLocale = () => useLocaleStore((state) => state.locale);
export const useSetLocale = () => useLocaleStore((state) => state.setLocale);
export const useResetLocale = () => useLocaleStore((state) => state.resetLocale);