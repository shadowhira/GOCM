import {
  SupportedTheme,
  defaultTheme,
  isValidTheme,
} from "@/config/themes";

/**
 * Lấy theme ban đầu từ localStorage hoặc system preference
 */
export const getInitialTheme = (): SupportedTheme => {
  if (typeof window === "undefined") return defaultTheme;

  // 1. Kiểm tra localStorage trước
  const savedTheme = localStorage.getItem("theme-store");
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      if (parsed?.state?.theme && isValidTheme(parsed.state.theme)) {
        return parsed.state.theme;
      }
    } catch {
      // Ignore parsing errors
    }
  }

  // 2. Kiểm tra system preference
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  // 3. Fallback về default
  return defaultTheme;
};

/**
 * Actions cho theme store
 */
type SetFunction = (partial: { theme: SupportedTheme }) => void;

export const themeActions = {
  setTheme: (set: SetFunction) => (theme: SupportedTheme) => {
    if (!isValidTheme(theme)) {
      console.warn(
        `Invalid theme: ${theme}. Using default: ${defaultTheme}`
      );
      return;
    }
    set({ theme });
  },

  resetTheme: (set: SetFunction) => () => {
    set({ theme: defaultTheme });
  },
};
