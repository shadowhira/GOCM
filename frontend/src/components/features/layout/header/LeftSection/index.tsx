"use client"

import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClassDropdown } from './ClassDropdown'
import { AdminBadge } from './AdminBadge'
import { usePathname } from 'next/navigation'
import { useRouterWithProgress } from '@/hooks/useRouterWithProgress'
import { Home, Menu, CalendarDays, LayoutDashboard } from 'lucide-react'
import { useUIStore } from '@/store/ui/useUIStore'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useGetCalendarEvents } from '@/queries/calendarQueries'
import { startOfDay, endOfMonth, parseISO } from 'date-fns'

interface LeftSectionProps {
  mode: 'dashboard' | 'class' | 'admin'
  classInfo?: {
    id: number
    name: string
    description?: string
    joinCode?: string
    memberCount: number
    coverImageUrl?: string
    coverColor?: string
    teacherName?: string
    teacherAvatarUrl?: string
  }
}

export const LeftSection = ({ mode, classInfo }: LeftSectionProps) => {
  const router = useRouterWithProgress()
  const pathname = usePathname()
  const { toggleSidebar } = useUIStore()
  const t = useTranslations()

  // Get upcoming events count for badge
  const now = new Date()
  const { data: calendarData } = useGetCalendarEvents({
    startDate: startOfDay(now).toISOString(),
    endDate: endOfMonth(now).toISOString(),
    eventType: 'all',
  })

  const upcomingEventsCount = useMemo(() => {
    if (!calendarData?.events) return 0
    const today = startOfDay(now)
    return calendarData.events.filter(
      (event) => parseISO(event.startDate) >= today
    ).length
  }, [calendarData?.events])

  const handleHomeClick = () => {
    router.push('/dashboard')
  }

  const handleCalendarClick = () => {
    router.push('/calendar')
  }

  // Check if current path is calendar
  const isCalendarActive = pathname.includes('/calendar')
  const isDashboardActive = pathname.includes('/dashboard')

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2 min-w-0 shrink-0">
      {mode === 'dashboard' && (
        <>
          {/* Admin Badge on left for dashboard */}
          <AdminBadge />
          
          {/* Mobile Navigation Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1.5">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem 
                  onClick={handleHomeClick}
                  className={cn(
                    "gap-2",
                    isDashboardActive && "bg-primary-100 text-primary-700"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t('my_classes')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleCalendarClick}
                  className={cn(
                    "gap-2",
                    isCalendarActive && "bg-primary-100 text-primary-700"
                  )}
                >
                  <div className="relative">
                    <CalendarDays className="h-4 w-4" />
                    {upcomingEventsCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 flex items-center justify-center text-[9px] font-medium bg-destructive text-destructive-foreground rounded-full px-0.5">
                        {upcomingEventsCount > 9 ? "9+" : upcomingEventsCount}
                      </span>
                    )}
                  </div>
                  {t('sidebar_calendar')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHomeClick}
              className={cn(
                "gap-1 lg:gap-2 text-xs lg:text-sm",
                "text-foreground p-1 lg:p-1.5 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              )}
            >
              <LayoutDashboard className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline">{t('my_classes')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCalendarClick}
              className={cn(
                "gap-1 lg:gap-2 text-xs lg:text-sm relative",
                "text-foreground p-1 lg:p-1.5 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              )}
            >
              <div className="relative">
                <CalendarDays className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                {upcomingEventsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 flex items-center justify-center text-[9px] font-medium bg-destructive text-destructive-foreground rounded-full px-0.5">
                    {upcomingEventsCount > 9 ? "9+" : upcomingEventsCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline">{t('sidebar_calendar')}</span>
            </Button>
          </div>
        </>
      )}

      {mode === 'class' && (
        <>
          {/* Toggle Sidebar Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-1 sm:p-1.5 shrink-0 text-foreground hover:text-primary-700 hover:bg-primary-50 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Admin Badge between toggle and class dropdown */}
          <AdminBadge />

          {/* Class Dropdown - responsive width limits */}
          {classInfo && (
            <div className="min-w-0 shrink max-w-[120px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-none">
              <ClassDropdown classInfo={classInfo} />
            </div>
          )}

          {/* Home Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHomeClick}
            className="p-1 sm:p-1.5 shrink-0 text-foreground hover:text-primary-700 hover:bg-primary-50 transition-colors"
            aria-label="Go to Dashboard"
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </>
      )}

      {mode === 'admin' && (
        <>
          {/* Toggle Sidebar Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-1 sm:p-1.5 shrink-0 text-foreground hover:text-primary-700 hover:bg-primary-50 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Admin Badge between toggle and home button */}
          <AdminBadge />

          {/* Home Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHomeClick}
            className="p-1 sm:p-1.5 shrink-0 text-foreground hover:text-primary-700 hover:bg-primary-50 transition-colors"
            aria-label="Go to Dashboard"
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </>
      )}
    </div>
  )
}