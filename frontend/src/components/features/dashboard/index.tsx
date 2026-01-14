"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { DashboardClassCard } from './DashboardClassCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useGetClassList } from '@/queries/classQueries'
import { useRouterWithProgress } from '@/hooks/useRouterWithProgress'
import { useTranslations } from 'next-intl'
import { RoleInClass, type ClassResponse } from '@/types/class'
import { cn } from '@/lib/utils'
import { DashboardContentHeader, type RoleFilter } from './DashboardContentHeader'
import { DashboardPagination } from './DashboardPagination'
import { useUrlParams } from '@/hooks/useUrlParams'
import { usePaginationHelpers } from '@/hooks/usePaginationHelpers'
import { CreateClassModal } from './CreateClassModal'
import { JoinClassModal } from './JoinClassModal'
import { DASHBOARD_PAGINATION } from '@/config/pagination'

interface DashboardProps {
  className?: string
  initialPage?: number
  initialPageSize?: number
  initialSearch?: string
}

export const Dashboard = ({ className }: DashboardProps) => {
  const router = useRouterWithProgress()
  const t = useTranslations()
  
  // Modal state controlled by URL hash (no page reload)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  
  // Role filter state
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  // Sync modal state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      setShowCreateModal(hash === '#create')
      setShowJoinModal(hash === '#join')
    }

    // Check initial hash
    handleHashChange()

    // Listen to hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
  
  // Use custom hook for URL parameter management
  const { params, updateParams } = useUrlParams('/dashboard', {
    page: DASHBOARD_PAGINATION.DEFAULT_PAGE_NUMBER,
    pageSize: DASHBOARD_PAGINATION.DEFAULT_PAGE_SIZE,
    search: undefined as string | undefined
  })

  const { page: currentPage, pageSize, search: searchQuery } = params

  // Server state with TanStack Query (SSR hydrated, then client refetches if needed)
  const { 
    data: classesData, 
    isLoading, 
    isError,
    error 
  } = useGetClassList({
    pageNumber: currentPage,
    pageSize: pageSize,
    name: searchQuery,
    // Backend will use current auth to filter when onlyMine=true
    onlyMine: true,
  })

  // Use pagination helpers for client-side logic
  const paginationHelpers = usePaginationHelpers(classesData || {
    items: [],
    totalItems: 0,
    pageIndex: DASHBOARD_PAGINATION.DEFAULT_PAGE_NUMBER,
    pageSize: DASHBOARD_PAGINATION.DEFAULT_PAGE_SIZE,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  })

  // Get classes and filter by role (must be before any return statements - Rules of Hooks)
  const classes = useMemo(() => classesData?.items || [], [classesData])
  const filteredClasses = useMemo(() => {
    if (roleFilter === 'all') return classes
    const targetRole = roleFilter === 'teacher' ? RoleInClass.TEACHER : RoleInClass.STUDENT
    return classes.filter((c) => c.userRoleInClass === targetRole)
  }, [classes, roleFilter])

  const handleEnterClass = (classId: number) => {
    router.push(`/class/${classId}`)
  }

  const handleCreateClass = () => {
    window.location.hash = 'create'
  }

  const handleJoinClass = () => {
    window.location.hash = 'join'
  }

  const handleCloseCreateModal = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setShowCreateModal(false)
  }

  const handleCloseJoinModal = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setShowJoinModal(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("container mx-auto p-4 md:p-6", className)}>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-800 mb-2">
            {t('my_classes')}
          </h1>
          <p className="text-muted-foreground">
            {t('loading_your_classes')}
          </p>
        </div>
        
        {/* Loading skeleton grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: DASHBOARD_PAGINATION.DEFAULT_PAGE_SIZE }).map((_, index) => (
            <Card key={index} className="min-h-60 animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
                <div className="flex gap-2 pt-4">
                  <div className="h-8 bg-muted rounded flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className={cn("container mx-auto p-4 md:p-6", className)}>
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-primary-800 mb-2">
            {t('something_went_wrong')}
          </h2>
          <p className="text-muted-foreground mb-4">
            {error?.message || t('failed_to_load_classes')}
          </p>
          <Button onClick={() => window.location.reload()} variant="primary">
            {t('try_again')}
          </Button>
        </div>
      </div>
    )
  }

  const isDataEmpty = filteredClasses.length === 0 && currentPage === 1

  return (
    <>
      <div className={cn("container mx-auto p-4 md:p-6", className)}>
        <DashboardContentHeader 
          classCount={filteredClasses.length}
          onCreateClass={handleCreateClass}
          onJoinClass={handleJoinClass}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />

        {isDataEmpty ? (
          // Empty state
          <div className="flex flex-col items-center justify-center min-h-96 text-center">
            <div className="text-6xl mb-6">📚</div>
            <h2 className="text-2xl font-semibold text-primary-800 mb-2">
              {t('no_classes_yet')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('start_your_learning_journey')}
            </p>
          </div>
        ) : (
          // Main content with classes
          <>
            {/* Classes grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 min-h-96">
              {filteredClasses.map((classItem: ClassResponse) => (
                <DashboardClassCard
                  key={classItem.id}
                  classData={classItem}
                  onEnterClass={handleEnterClass}
                />
              ))}
            </div>

            {/* Pagination */}
            {classesData && (
              <DashboardPagination 
                data={classesData}
                currentPage={currentPage || 1}
                onPageChange={(page: number) => {
                  updateParams({ page })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                paginationHelpers={paginationHelpers}
              />
            )}
          </>
        )}
      </div>

      {/* Modals - URL-driven state (shallow routing pattern) */}
      <CreateClassModal 
        open={showCreateModal} 
        onClose={handleCloseCreateModal} 
      />
      <JoinClassModal 
        open={showJoinModal} 
        onClose={handleCloseJoinModal} 
      />
    </>
  )
}