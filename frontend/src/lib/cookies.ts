import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth-token';

export const cookieUtils = {
  // Set token (CSR only - in browser)
  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, {
      expires: 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  },

  // Get token (works in both CSR and SSR)
  getToken: (cookieString?: string): string | null => {
    // SSR: use cookie string from request headers
    if (cookieString) {
      const match = cookieString.match(new RegExp(`(^|;\\s*)${TOKEN_KEY}=([^;]*)`));
      return match ? decodeURIComponent(match[2]) : null;
    }
    
    // CSR: use js-cookie
    return Cookies.get(TOKEN_KEY) || null;
  },

  // Remove token
  removeToken: () => {
    Cookies.remove(TOKEN_KEY);
  },
};
