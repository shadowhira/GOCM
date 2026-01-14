/**
 * SearchResultItem Component
 * Individual search result item with icon, title, subtitle
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  FileText,
  File,
  ClipboardList,
  User,
  Calendar,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SearchResultItemProps } from './types';
import type { SearchResultType, MemberSearchResult, PostSearchResult } from './types';

const TYPE_ICONS: Record<SearchResultType, React.ElementType> = {
  class: GraduationCap,
  post: FileText,
  document: File,
  assignment: ClipboardList,
  member: User,
};

const TYPE_COLORS: Record<SearchResultType, string> = {
  class: 'text-primary bg-primary/10',
  post: 'text-blue-500 bg-blue-500/10',
  document: 'text-green-500 bg-green-500/10',
  assignment: 'text-orange-500 bg-orange-500/10',
  member: 'text-purple-500 bg-purple-500/10',
};

export function SearchResultItem({
  result,
  isSelected,
  onClick,
  onMouseEnter,
}: SearchResultItemProps) {
  const Icon = TYPE_ICONS[result.type];

  // Special rendering for member type with avatar
  if (result.type === 'member') {
    const memberResult = result as MemberSearchResult;
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
          'text-left transition-colors duration-150',
          'focus:outline-none',
          isSelected 
            ? 'bg-accent text-accent-foreground' 
            : 'hover:bg-accent/50'
        )}
      >
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={memberResult.avatarUrl} alt={memberResult.title} />
          <AvatarFallback className={TYPE_COLORS.member}>
            {memberResult.title.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{memberResult.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {memberResult.email}
          </p>
        </div>
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-medium shrink-0',
          TYPE_COLORS.member
        )}>
          {memberResult.role}
        </span>
      </button>
    );
  }

  // Special rendering for post type with comment count
  if (result.type === 'post') {
    const postResult = result as PostSearchResult;
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
          'text-left transition-colors duration-150',
          'focus:outline-none',
          isSelected 
            ? 'bg-accent text-accent-foreground' 
            : 'hover:bg-accent/50'
        )}
      >
        <div className={cn(
          'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
          TYPE_COLORS.post
        )}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{postResult.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{postResult.authorName}</span>
            {postResult.commentCount !== undefined && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 shrink-0">
                  <MessageSquare className="h-3 w-3" />
                  {postResult.commentCount}
                </span>
              </>
            )}
          </div>
        </div>
      </button>
    );
  }

  // Default rendering for other types
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
        'text-left transition-colors duration-150',
        'focus:outline-none',
        isSelected 
          ? 'bg-accent text-accent-foreground' 
          : 'hover:bg-accent/50'
      )}
    >
      <div className={cn(
        'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
        TYPE_COLORS[result.type]
      )}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{result.title}</p>
        {result.subtitle && (
          <p className="text-xs text-muted-foreground truncate">
            {result.subtitle}
          </p>
        )}
      </div>
      {/* Additional info based on type */}
      {result.type === 'class' && 'memberCount' in result && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Users className="h-3.5 w-3.5" />
          {result.memberCount}
        </span>
      )}
      {result.type === 'assignment' && 'dueDate' in result && result.dueDate && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(result.dueDate).toLocaleDateString()}
        </span>
      )}
    </button>
  );
}
