/**
 * Search Command Component Types
 * Context-aware search supporting Dashboard and Class Detail modes
 */

// Search context modes
export type SearchContextMode = 'dashboard' | 'class';

// Search result item types
export type SearchResultType = 'class' | 'post' | 'document' | 'assignment' | 'member';

// Base search result interface
export interface BaseSearchResult {
  id: number;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  icon?: string;
  url?: string;
}

// Class search result (Dashboard mode)
export interface ClassSearchResult extends BaseSearchResult {
  type: 'class';
  memberCount: number;
  teacherName: string;
  description?: string;
  coverImage?: string;
}

// Post search result (Class mode)
export interface PostSearchResult extends BaseSearchResult {
  type: 'post';
  content: string;
  createdAt: string;
  authorName: string;
  authorAvatar?: string;
  commentCount?: number;
}

// Document search result (Class mode)
export interface DocumentSearchResult extends BaseSearchResult {
  type: 'document';
  fileName: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: string;
  uploadedBy?: string;
}

// Assignment search result (Class mode)
export interface AssignmentSearchResult extends BaseSearchResult {
  type: 'assignment';
  dueDate?: string;
  status?: 'pending' | 'submitted' | 'graded' | 'overdue';
  maxScore?: number;
}

// Member search result (Class mode)
export interface MemberSearchResult extends BaseSearchResult {
  type: 'member';
  email: string;
  avatarUrl?: string;
  role: string;
  points?: number;
}

// Union type for all search results
export type SearchResult = 
  | ClassSearchResult 
  | PostSearchResult 
  | DocumentSearchResult 
  | AssignmentSearchResult 
  | MemberSearchResult;

// Search filter options based on context
export interface DashboardSearchFilters {
  query: string;
}

export interface ClassSearchFilters {
  query: string;
  types?: SearchResultType[];
}

export type SearchFilters = DashboardSearchFilters | ClassSearchFilters;

// Search context information
export interface SearchContext {
  mode: SearchContextMode;
  classId?: number;
  className?: string;
}

// Search state
export interface SearchState {
  query: string;
  isOpen: boolean;
  isLoading: boolean;
  results: SearchResult[];
  selectedIndex: number;
  activeFilter: SearchResultType | 'all';
  recentSearches: string[];
  error?: string;
}

// Search command props
export interface SearchCommandProps {
  context: SearchContext;
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

// Search trigger button props
export interface SearchTriggerProps {
  onClick: () => void;
  placeholder?: string;
  className?: string;
  shortcutKey?: string;
}

// Search result item props
export interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

// Search filter badge props
export interface SearchFilterBadgeProps {
  type: SearchResultType | 'all';
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

// Recent search item props
export interface RecentSearchItemProps {
  query: string;
  onClick: () => void;
  onRemove: () => void;
}

// Search API response types
export interface SearchClassesResponse {
  items: ClassSearchResult[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchClassResourcesResponse {
  posts: PostSearchResult[];
  documents: DocumentSearchResult[];
  assignments: AssignmentSearchResult[];
  members: MemberSearchResult[];
  total: number;
}

// Hook return types
export interface UseSearchReturn {
  state: SearchState;
  actions: {
    setQuery: (query: string) => void;
    setFilter: (filter: SearchResultType | 'all') => void;
    selectNext: () => void;
    selectPrev: () => void;
    selectCurrent: () => void;
    clearSearch: () => void;
    addRecentSearch: (query: string) => void;
    removeRecentSearch: (query: string) => void;
  };
}

export interface UseSearchContextReturn {
  context: SearchContext;
  isClassContext: boolean;
  isDashboardContext: boolean;
}

export interface UseSearchNavigationReturn {
  navigateToResult: (result: SearchResult) => void;
  getResultUrl: (result: SearchResult) => string;
}
