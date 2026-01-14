/**
 * Storage utilities for managing localStorage
 * Handles clearing user-specific data on logout
 */

export const USER_STORAGE_KEYS = {
  AUTH: 'auth-store',
  LIVEKIT: 'lk-user-choices',
  RECENT_SEARCHES: 'ocm_recent_searches',
  QUIZ_PREFIX: 'quiz_answers_',
} as const;

/**
 * Clear all user-specific data from localStorage
 * Called during logout to prevent data leakage between accounts
 */
export function clearUserStorage(): void {
  if (typeof window === 'undefined') return;

  // Clear fixed keys
  localStorage.removeItem(USER_STORAGE_KEYS.AUTH);
  localStorage.removeItem(USER_STORAGE_KEYS.LIVEKIT);
  localStorage.removeItem(USER_STORAGE_KEYS.RECENT_SEARCHES);

  // Clear all quiz answers (dynamic keys with pattern quiz_answers_*)
  Object.keys(localStorage)
    .filter((key) => key.startsWith(USER_STORAGE_KEYS.QUIZ_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}
