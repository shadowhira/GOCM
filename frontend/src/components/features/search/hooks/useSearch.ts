/**
 * useSearch Hook
 * Main search logic with state management and API integration
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/api/searchApi';
import { SEARCH_CONFIG, STORAGE_KEYS } from '../SearchCommand/constants';
import type {
  SearchState,
  SearchResult,
  SearchResultType,
  SearchContext,
  UseSearchReturn,
  ClassSearchResult,
  PostSearchResult,
  DocumentSearchResult,
  AssignmentSearchResult,
  MemberSearchResult,
} from '../SearchCommand/types';
import type { ClassResponse, ClassMemberResponse } from '@/types/class';
import type { PostResponse } from '@/types/post';
import type { DocumentResponse } from '@/types/document';
import type { AssignmentResponse } from '@/types/assignment';

// Transform API responses to SearchResult format
function transformClassToSearchResult(c: ClassResponse): ClassSearchResult {
  return {
    id: c.id,
    type: 'class',
    title: c.name,
    subtitle: c.description || undefined,
    memberCount: c.memberCount,
    teacherName: c.createdByUserName || '',
    description: c.description || undefined,
  };
}

function transformPostToSearchResult(p: PostResponse): PostSearchResult {
  return {
    id: p.id,
    type: 'post',
    title: p.title?.slice(0, 50) || 'Bài viết',
    subtitle: p.createdBy?.userName,
    content: p.content || '',
    createdAt: p.createdAt,
    authorName: p.createdBy?.userName || '',
    authorAvatar: p.createdBy?.avatarUrl || undefined,
    commentCount: p.commentCount,
  };
}

function transformDocumentToSearchResult(d: DocumentResponse): DocumentSearchResult {
  return {
    id: d.id,
    type: 'document',
    title: d.fileName,
    subtitle: String(d.fileType),
    fileName: d.fileName,
    fileType: String(d.fileType),
    fileSize: undefined,
    uploadedAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
  };
}

function transformAssignmentToSearchResult(a: AssignmentResponse): AssignmentSearchResult {
  return {
    id: a.id,
    type: 'assignment',
    title: a.title,
    subtitle: a.content?.slice(0, 50) || undefined,
    dueDate: a.deadline instanceof Date ? a.deadline.toISOString() : String(a.deadline),
    maxScore: a.maxScore,
  };
}

function transformMemberToSearchResult(m: ClassMemberResponse): MemberSearchResult {
  return {
    id: m.id,
    type: 'member',
    title: m.userName,
    subtitle: m.userEmail,
    email: m.userEmail,
    avatarUrl: m.avatarUrl || undefined,
    role: m.roleInClass,
    points: m.points,
  };
}

// Load recent searches from localStorage
function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save recent searches to localStorage
function saveRecentSearches(searches: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
  } catch {
    // Ignore storage errors
  }
}

export function useSearch(context: SearchContext): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Default filter: 'all' for dashboard, 'post' for class (since we removed 'all' from class filters)
  const [activeFilter, setActiveFilter] = useState<SearchResultType | 'all'>(
    context.mode === 'dashboard' ? 'all' : 'post'
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_CONFIG.DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery, activeFilter]);

  // Determine if we should search
  const shouldSearch = debouncedQuery.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH;

  // Search classes (Dashboard mode)
  const classesQuery = useQuery({
    queryKey: ['search', 'classes', debouncedQuery],
    queryFn: () => searchApi.searchClasses({ query: debouncedQuery }),
    enabled: context.mode === 'dashboard' && shouldSearch,
    staleTime: 30000, // 30 seconds
  });

  // Search class resources (Class mode)
  const resourcesQuery = useQuery({
    queryKey: ['search', 'resources', context.classId, debouncedQuery, activeFilter],
    queryFn: () => searchApi.searchClassResources({
      classId: context.classId!,
      query: debouncedQuery,
      type: activeFilter === 'all' ? undefined : activeFilter as Exclude<SearchResultType, 'class'>,
    }),
    enabled: context.mode === 'class' && !!context.classId && shouldSearch,
    staleTime: 30000,
  });

  // Transform and combine results
  const results = useMemo<SearchResult[]>(() => {
    if (context.mode === 'dashboard') {
      if (!classesQuery.data?.items) return [];
      return classesQuery.data.items.map(transformClassToSearchResult);
    }

    if (context.mode === 'class' && resourcesQuery.data) {
      const { posts, documents, assignments, members } = resourcesQuery.data;
      
      let combined: SearchResult[] = [];
      
      // No 'all' filter in class mode - show results based on selected filter
      if (activeFilter === 'post') {
        combined = [...combined, ...posts.map(transformPostToSearchResult)];
      }
      if (activeFilter === 'document') {
        combined = [...combined, ...documents.map(transformDocumentToSearchResult)];
      }
      if (activeFilter === 'assignment') {
        combined = [...combined, ...assignments.map(transformAssignmentToSearchResult)];
      }
      if (activeFilter === 'member') {
        combined = [...combined, ...members.map(transformMemberToSearchResult)];
      }
      
      return combined.slice(0, SEARCH_CONFIG.MAX_RESULTS);
    }

    return [];
  }, [context.mode, classesQuery.data, resourcesQuery.data, activeFilter]);

  // Determine loading state
  const isLoading = context.mode === 'dashboard' 
    ? classesQuery.isLoading 
    : resourcesQuery.isLoading;

  // Determine error state
  const error = context.mode === 'dashboard'
    ? classesQuery.error?.message
    : resourcesQuery.error?.message;

  // Actions
  const handleSetQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const handleSetFilter = useCallback((filter: SearchResultType | 'all') => {
    setActiveFilter(filter);
  }, []);

  const selectNext = useCallback(() => {
    setSelectedIndex(prev => 
      prev < results.length - 1 ? prev + 1 : prev
    );
  }, [results.length]);

  const selectPrev = useCallback(() => {
    setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
  }, []);

  const selectCurrent = useCallback(() => {
    return results[selectedIndex];
  }, [results, selectedIndex]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedIndex(0);
    // Reset to default filter based on context
    setActiveFilter(context.mode === 'dashboard' ? 'all' : 'post');
  }, [context.mode]);

  const addRecentSearch = useCallback((searchQuery: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== searchQuery);
      const updated = [searchQuery, ...filtered].slice(0, SEARCH_CONFIG.MAX_RECENT_SEARCHES);
      saveRecentSearches(updated);
      return updated;
    });
  }, []);

  const removeRecentSearch = useCallback((searchQuery: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== searchQuery);
      saveRecentSearches(updated);
      return updated;
    });
  }, []);

  const state: SearchState = {
    query,
    isOpen: false, // Managed by parent component
    isLoading,
    results,
    selectedIndex,
    activeFilter,
    recentSearches,
    error,
  };

  return {
    state,
    actions: {
      setQuery: handleSetQuery,
      setFilter: handleSetFilter,
      selectNext,
      selectPrev,
      selectCurrent,
      clearSearch,
      addRecentSearch,
      removeRecentSearch,
    },
  };
}
