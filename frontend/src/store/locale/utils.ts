import {
  SupportedLocale,
  defaultLocale,
  isValidLocale,
} from "@/config/locales";

/**
 * Lấy locale ban đầu từ localStorage hoặc browser không có thì dùng defaultLocale
 */
export const getInitialLocale = (): SupportedLocale => {
  // if (typeof window === "undefined") return defaultLocale;

  // // 1. Kiểm tra localStorage trước
  // const savedLocale = localStorage.getItem("locale");
  // if (savedLocale) {
  //   try {
  //     const parsed = JSON.parse(savedLocale);
  //     if (parsed?.state?.locale && isValidLocale(parsed.state.locale)) {
  //       return parsed.state.locale;
  //     }
  //   } catch {
  //     // Ignore parsing errors
  //   }
  // }

  // // 2. Lấy locale từ browser (nếu không thấy trong localStorage)
  // const browserLocale = navigator.language.split("-")[0]; // en-US -> en
  // if (isValidLocale(browserLocale)) {
  //   return browserLocale;
  // }

  // // 3. Fallback về default
  return defaultLocale;
};

/**
 * Actions cho locale store
 */
type SetFunction = (partial: { locale: SupportedLocale }) => void;

export const localeActions = {
  setLocale: (set: SetFunction) => (locale: SupportedLocale) => {
    if (!isValidLocale(locale)) {
      console.warn(
        `Invalid locale: ${locale}. Using default: ${defaultLocale}`
      );
      return;
    }
    set({ locale });
  },

  resetLocale: (set: SetFunction) => () => {
    set({ locale: defaultLocale });
  },
};
