/**
 * SearchEmptyState Component
 * Empty state display for search results
 */

'use client';

import React from 'react';
import { Search, AlertCircle, Loader2, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface SearchEmptyStateProps {
  type: 'no_query' | 'no_results' | 'error' | 'loading';
  query?: string;
  className?: string;
}

export function SearchEmptyState({ type, query, className }: SearchEmptyStateProps) {
  const t = useTranslations();

  const configs = {
    no_query: {
      icon: Search,
      title: t('search_empty_start_typing'),
      description: t('search_empty_start_typing_desc'),
      iconColor: 'text-muted-foreground',
    },
    no_results: {
      icon: FileQuestion,
      title: t('search_empty_no_results'),
      description: t('search_empty_no_results_desc', { query: query || '' }),
      iconColor: 'text-muted-foreground',
    },
    error: {
      icon: AlertCircle,
      title: t('search_empty_error'),
      description: t('search_empty_error_desc'),
      iconColor: 'text-destructive',
    },
    loading: {
      icon: Loader2,
      title: t('search_empty_loading'),
      description: '',
      iconColor: 'text-primary',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4',
      'text-center',
      className
    )}>
      <div className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center mb-4',
        'bg-muted'
      )}>
        <Icon className={cn(
          'h-6 w-6',
          config.iconColor,
          type === 'loading' && 'animate-spin'
        )} />
      </div>
      <h3 className="font-medium text-sm mb-1">{config.title}</h3>
      {config.description && (
        <p className="text-xs text-muted-foreground max-w-[250px]">
          {config.description}
        </p>
      )}
    </div>
  );
}
