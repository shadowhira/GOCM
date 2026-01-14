/**
 * useSearchNavigation Hook
 * Handles navigation when a search result is selected
 */

import { useRouter, useParams } from 'next/navigation';
import { useCallback } from 'react';
import type { SearchResult, UseSearchNavigationReturn } from '../SearchCommand/types';

export function useSearchNavigation(): UseSearchNavigationReturn {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';

  const getResultUrl = useCallback((result: SearchResult): string => {
    switch (result.type) {
      case 'class':
        return `/${locale}/class/${result.id}`;
      
      case 'post':
        // Posts use hash navigation: /class/45#post-104
        const classIdForPost = params?.classId;
        return classIdForPost ? `/${locale}/class/${classIdForPost}#post-${result.id}` : '#';
      
      case 'document':
        // Documents use hash navigation: /class/45/documents#doc-104
        return params?.classId 
          ? `/${locale}/class/${params.classId}/documents#doc-${result.id}`
          : '#';
      
      case 'assignment':
        return params?.classId
          ? `/${locale}/class/${params.classId}/assignments/${result.id}`
          : '#';
      
      case 'member':
        // For members, we might open the user detail modal instead of navigating
        // Return empty to indicate modal should be used
        return '';
      
      default:
        return '#';
    }
  }, [locale, params?.classId]);

  const navigateToResult = useCallback((result: SearchResult) => {
    const url = getResultUrl(result);
    
    // For members, we don't navigate - the caller should handle opening the modal
    if (result.type === 'member' || !url) {
      return;
    }

    // For post type, we need to handle hash navigation differently
    // If we're already on the same class page, just update the hash to trigger modal
    if (result.type === 'post' && params?.classId) {
      const currentPath = window.location.pathname;
      const targetBasePath = `/${locale}/class/${params.classId}`;
      
      if (currentPath === targetBasePath) {
        // Same page - directly set hash and trigger event
        window.location.hash = `post-${result.id}`;
        return;
      }
    }

    // For document type, handle hash navigation similarly
    if (result.type === 'document' && params?.classId) {
      const currentPath = window.location.pathname;
      const targetBasePath = `/${locale}/class/${params.classId}/documents`;
      
      if (currentPath === targetBasePath) {
        // Same page - directly set hash and trigger event
        window.location.hash = `doc-${result.id}`;
        return;
      }
    }

    // Navigate to the URL (cross-page navigation)
    // Use window.location for hash URLs to ensure hashchange event fires
    if (url.includes('#')) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  }, [router, getResultUrl, locale, params?.classId]);

  return {
    navigateToResult,
    getResultUrl,
  };
}
