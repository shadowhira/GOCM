/**
 * SearchTrigger Component
 * Button that opens the search dialog with keyboard shortcut display
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Search, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { SearchTriggerProps } from './types';

export function SearchTrigger({
  onClick,
  placeholder,
  className,
  shortcutKey = 'K',
}: SearchTriggerProps) {
  const t = useTranslations();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 w-full max-w-md',
        'bg-muted/50 hover:bg-muted',
        'border border-border rounded-lg',
        'text-muted-foreground text-sm',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left truncate">
        {placeholder || t('search_placeholder_default')}
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-background border border-border rounded">
        {isMac ? (
          <Command className="h-3 w-3" />
        ) : (
          <span>Ctrl</span>
        )}
        <span>{shortcutKey}</span>
      </kbd>
    </button>
  );
}
