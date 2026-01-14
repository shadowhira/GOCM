/**
 * SearchFilterBadge Component
 * Filter badge for search result types
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Search,
  FileText,
  File,
  ClipboardList,
  Users,
  GraduationCap,
} from 'lucide-react';
import type { SearchFilterBadgeProps } from './types';
import type { SearchResultType } from './types';

const FILTER_ICONS: Record<SearchResultType | 'all', React.ElementType> = {
  all: Search,
  class: GraduationCap,
  post: FileText,
  document: File,
  assignment: ClipboardList,
  member: Users,
};

export function SearchFilterBadge({
  type,
  isActive,
  onClick,
  count,
}: SearchFilterBadgeProps) {
  const t = useTranslations();
  const Icon = FILTER_ICONS[type];

  const labelKey = type === 'all' 
    ? 'search_filters_all' 
    : `search_filters_${type}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'text-xs font-medium whitespace-nowrap',
        'border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        isActive
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{t(labelKey)}</span>
      {count !== undefined && count > 0 && (
        <span className={cn(
          'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
          isActive 
            ? 'bg-primary-foreground/20' 
            : 'bg-muted'
        )}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
