"use client"

import React from 'react'
import { SearchCommand } from '@/components/features/search'
import type { SearchContext } from '@/components/features/search'

interface SearchSectionProps {
  showMobileSearch: boolean
  onMobileSearchToggle: () => void
  searchContext?: SearchContext
}

export const SearchSection = ({ 
  showMobileSearch, 
  onMobileSearchToggle,
  searchContext,
}: SearchSectionProps) => {
  // Default to dashboard context if not provided
  const context: SearchContext = searchContext || { mode: 'dashboard' }

  return (
    <>
      {/* Desktop Search - visible from md */}
      <div className="flex-1 max-w-xs lg:max-w-md xl:max-w-2xl hidden md:block mx-1 lg:mx-2">
        <SearchCommand context={context} />
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-30 md:hidden animate-in fade-in duration-200" 
            onClick={onMobileSearchToggle}
          />
          {/* Search Panel */}
          <div className="fixed top-14 sm:top-16 left-0 right-0 z-40 bg-card border-b border-border p-3 md:hidden shadow-lg animate-in slide-in-from-top duration-200">
            <div className="max-w-md mx-auto">
              <SearchCommand context={context} />
            </div>
          </div>
        </>
      )}
    </>
  )
}