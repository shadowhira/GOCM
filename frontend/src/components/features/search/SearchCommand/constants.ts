/**
 * Search Command Constants
 */

import { SearchResultType } from './types';

// Search configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_MS: 300,
  MAX_RESULTS: 20,
  MAX_RECENT_SEARCHES: 5,
  KEYBOARD_SHORTCUT: 'k',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  RECENT_SEARCHES: 'ocm_recent_searches',
} as const;

// Filter options for Dashboard context (only classes)
export const DASHBOARD_FILTER_OPTIONS: Array<{
  type: 'all';
  labelKey: string;
  icon: string;
}> = [
  { type: 'all', labelKey: 'search_filters_all', icon: 'Search' },
];

// Filter options for Class context (without 'all')
export const CLASS_FILTER_OPTIONS: Array<{
  type: SearchResultType;
  labelKey: string;
  icon: string;
}> = [
  { type: 'post', labelKey: 'search_filters_post', icon: 'FileText' },
  { type: 'document', labelKey: 'search_filters_document', icon: 'File' },
  { type: 'assignment', labelKey: 'search_filters_assignment', icon: 'ClipboardList' },
  { type: 'member', labelKey: 'search_filters_member', icon: 'Users' },
];

// Result type icons mapping
export const RESULT_TYPE_ICONS: Record<SearchResultType, string> = {
  class: 'GraduationCap',
  post: 'FileText',
  document: 'File',
  assignment: 'ClipboardList',
  member: 'User',
};

// Result type colors mapping (for badges/highlights)
export const RESULT_TYPE_COLORS: Record<SearchResultType, string> = {
  class: 'bg-primary/10 text-primary',
  post: 'bg-blue-500/10 text-blue-500',
  document: 'bg-green-500/10 text-green-500',
  assignment: 'bg-orange-500/10 text-orange-500',
  member: 'bg-purple-500/10 text-purple-500',
};

// Keyboard navigation keys
export const KEYBOARD_KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  TAB: 'Tab',
} as const;

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
} as const;

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  NO_QUERY: 'search_empty_start_typing',
  NO_RESULTS: 'search_empty_no_results',
  ERROR: 'search_empty_error',
  LOADING: 'search_empty_loading',
} as const;
