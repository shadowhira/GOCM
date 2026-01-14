/**
 * RecentSearchItem Component
 * Individual recent search item with remove button
 */

'use client';

import React from 'react';
import { Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecentSearchItemProps } from './types';

export function RecentSearchItem({
  query,
  onClick,
  onRemove,
}: RecentSearchItemProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
        'text-left transition-colors duration-150 cursor-pointer',
        'hover:bg-muted/50 group',
        'focus:outline-none focus:bg-muted/50'
      )}
    >
      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="flex-1 text-sm truncate">{query}</span>
      <button
        type="button"
        onClick={handleRemove}
        className={cn(
          'p-1 rounded-md shrink-0',
          'opacity-0 group-hover:opacity-100',
          'hover:bg-muted text-muted-foreground hover:text-foreground',
          'transition-opacity duration-150',
          'focus:outline-none focus:opacity-100'
        )}
        aria-label="Remove"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
