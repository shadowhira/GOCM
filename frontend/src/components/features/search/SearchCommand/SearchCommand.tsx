/**
 * SearchCommand Component
 * Main search dialog with command palette style UI
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '../hooks/useSearch';
import { useSearchNavigation } from '../hooks/useSearchNavigation';
import { useSearchKeyboard } from '../hooks/useSearchKeyboard';
import { SearchTrigger } from './SearchTrigger';
import { SearchFilterBadge } from './SearchFilterBadge';
import { SearchResultItem } from './SearchResultItem';
import { SearchEmptyState } from './SearchEmptyState';
import { RecentSearchItem } from './RecentSearchItem';
import { CLASS_FILTER_OPTIONS, DASHBOARD_FILTER_OPTIONS, SEARCH_CONFIG } from './constants';
import type { SearchCommandProps, SearchResult, SearchResultType } from './types';
import { UserDetailModal, useUserDetailModal } from '../../user/UserDetailModal';
import type { UserBasicInfo } from '../../user/UserDetailModal/types';
import type { MemberSearchResult } from './types';

export function SearchCommand({
  context,
  onSelect,
  placeholder,
  className,
}: SearchCommandProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { state, actions } = useSearch(context);
  const { navigateToResult } = useSearchNavigation();
  
  // User detail modal for member results
  const { isOpen: isUserModalOpen, selectedUser, classContext, openModal: openUserModal, setIsOpen: setUserModalOpen } = useUserDetailModal();

  // Get filter options based on context
  const filterOptions = context.mode === 'dashboard' 
    ? DASHBOARD_FILTER_OPTIONS 
    : CLASS_FILTER_OPTIONS;

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    // Add to recent searches
    if (state.query.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      actions.addRecentSearch(state.query);
    }

    // For member type, open user detail modal
    if (result.type === 'member') {
      const memberResult = result as MemberSearchResult;
      const userInfo: UserBasicInfo = {
        id: memberResult.id,
        displayName: memberResult.title,
        email: memberResult.email,
        avatarUrl: memberResult.avatarUrl,
      };
      openUserModal(userInfo);
      setIsOpen(false);
      return;
    }

    // Custom handler or default navigation
    if (onSelect) {
      onSelect(result);
    } else {
      navigateToResult(result);
    }
    
    setIsOpen(false);
    actions.clearSearch();
  }, [state.query, actions, onSelect, navigateToResult, openUserModal]);

  // Handle keyboard confirm
  const handleConfirm = useCallback(() => {
    const selectedResult = state.results[state.selectedIndex];
    if (selectedResult) {
      handleResultSelect(selectedResult);
    }
  }, [state.results, state.selectedIndex, handleResultSelect]);

  // Keyboard navigation
  useSearchKeyboard({
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onSelectNext: actions.selectNext,
    onSelectPrev: actions.selectPrev,
    onConfirm: handleConfirm,
  });

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle recent search click
  const handleRecentSearchClick = useCallback((query: string) => {
    actions.setQuery(query);
  }, [actions]);

  // Get placeholder based on context
  const searchPlaceholder = placeholder || (
    context.mode === 'dashboard'
      ? t('search_placeholder_dashboard')
      : t('search_placeholder_class')
  );

  // Determine empty state type
  const getEmptyStateType = () => {
    if (state.isLoading) return 'loading';
    if (state.error) return 'error';
    if (state.query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) return 'no_query';
    return 'no_results';
  };

  const showResults = state.query.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH && state.results.length > 0;
  const showEmptyState = state.query.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH && state.results.length === 0;
  const showRecentSearches = state.query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH && state.recentSearches.length > 0;

  return (
    <>
      <SearchTrigger
        onClick={() => setIsOpen(true)}
        placeholder={searchPlaceholder}
        className={className}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className={cn(
            'max-w-2xl p-0 gap-0 overflow-hidden',
            'top-[15%] translate-y-0',
            '[&>button]:hidden' // Hide default close button
          )}
        >
          <VisuallyHidden>
            <DialogTitle>{t('search_title')}</DialogTitle>
          </VisuallyHidden>
          
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={state.query}
              onChange={(e) => actions.setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                'flex-1 bg-transparent border-none outline-none',
                'text-base placeholder:text-muted-foreground'
              )}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {state.query && (
              <button
                type="button"
                onClick={() => actions.clearSearch()}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters (only in class context) */}
          {context.mode === 'class' && (
            <div className="flex items-center gap-2 px-4 py-2 border-b overflow-x-auto">
              {filterOptions.map((filter) => (
                <SearchFilterBadge
                  key={filter.type}
                  type={filter.type}
                  isActive={state.activeFilter === filter.type}
                  onClick={() => actions.setFilter(filter.type as SearchResultType | 'all')}
                />
              ))}
            </div>
          )}

          {/* Content Area */}
          <ScrollArea className="max-h-[400px]">
            <div className="p-2">
              {/* Loading State */}
              {state.isLoading && (
                <SearchEmptyState type="loading" />
              )}

              {/* Results */}
              {!state.isLoading && showResults && (
                <div className="space-y-1">
                  {state.results.map((result, index) => (
                    <SearchResultItem
                      key={`${result.type}-${result.id}`}
                      result={result}
                      isSelected={index === state.selectedIndex}
                      onClick={() => handleResultSelect(result)}
                      onMouseEnter={() => {
                        // Update selected index on hover
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!state.isLoading && showEmptyState && (
                <SearchEmptyState 
                  type={getEmptyStateType()} 
                  query={state.query}
                />
              )}

              {/* Recent Searches */}
              {!state.isLoading && showRecentSearches && (
                <div>
                  <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                    {t('search_recent')}
                  </p>
                  <div className="space-y-0.5">
                    {state.recentSearches.map((query) => (
                      <RecentSearchItem
                        key={query}
                        query={query}
                        onClick={() => handleRecentSearchClick(query)}
                        onRemove={() => actions.removeRecentSearch(query)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Initial State (no query, no recent) */}
              {!state.isLoading && 
               state.query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH && 
               state.recentSearches.length === 0 && (
                <SearchEmptyState type="no_query" />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* User Detail Modal for member results */}
      {selectedUser && (
        <UserDetailModal
          open={isUserModalOpen}
          onOpenChange={setUserModalOpen}
          user={selectedUser}
          classContext={classContext}
        />
      )}
    </>
  );
}
