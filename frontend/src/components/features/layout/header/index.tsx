"use client"

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import type { SearchContext } from '@/components/features/search'

const LeftSection = dynamic(() => import('./LeftSection').then(mod => mod.LeftSection), {
  ssr: false,
})

const SearchSection = dynamic(() => import('./SearchSection').then(mod => mod.SearchSection), {
  ssr: false,
})

const RightSection = dynamic(() => import('./RightSection').then(mod => mod.RightSection), {
  ssr: false,
})

interface HeaderProps {
  className?: string
  // Mode: dashboard (no left elements), class (show class controls), admin (show admin controls)
  mode?: 'dashboard' | 'class' | 'admin'
  // Class mode props
  classInfo?: {
    id: number
    name: string
    description?: string
    joinCode?: string
    memberCount: number
    coverImage?: string
    teacherName?: string
    teacherAvatarUrl?: string
  }
}

export const Header = ({
  className,
  mode = 'dashboard',
  classInfo
}: HeaderProps) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  // Compute search context based on mode
  const searchContext = useMemo<SearchContext>(() => {
    if (mode === 'class' && classInfo) {
      return {
        mode: 'class',
        classId: classInfo.id,
        className: classInfo.name,
      }
    }
    return { mode: 'dashboard' }
  }, [mode, classInfo])

  const handleMobileSearchToggle = () => {
    setShowMobileSearch(!showMobileSearch)
  }

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "w-full h-14 sm:h-16 bg-card border-b border-border shadow-sm",
        "px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2 lg:gap-4",
        className
      )}>
        {/* Left Section */}
        <LeftSection mode={mode} classInfo={classInfo} />

        {/* Search Section */}
        <SearchSection
          showMobileSearch={showMobileSearch}
          onMobileSearchToggle={handleMobileSearchToggle}
          searchContext={searchContext}
        />

        {/* Right Section */}
        <RightSection
          showMobileSearch={showMobileSearch}
          onMobileSearchToggle={handleMobileSearchToggle}
        />
      </header>
    </>
  )
}
