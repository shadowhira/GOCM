"use client"

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useUIStore } from '@/store/ui/useUIStore'
import { cn } from '@/lib/utils'
import { useGetClassById } from '@/queries/classQueries'
import { useSetClassAppearanceSettings } from '@/store'

const ClassSidebar = dynamic(
  () => import('@/components/features/layout/sidebar').then(mod => mod.ClassSidebar),
  { ssr: false }
)

interface ClassLayoutProps {
  classId: string
  children: React.ReactNode
}

export const ClassLayout = ({ classId, children }: ClassLayoutProps) => {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const classIdNum = parseInt(classId)
  
  // Fetch class data to get appearance settings
  const { data: classData } = useGetClassById(classIdNum)
  const setClassAppearanceSettings = useSetClassAppearanceSettings()
  
  // Hydrate appearance settings into cosmetics store when class data is available
  useEffect(() => {
    if (classData?.appearanceSettings) {
      setClassAppearanceSettings(classIdNum, classData.appearanceSettings)
    }
  }, [classData?.appearanceSettings, classIdNum, setClassAppearanceSettings])

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <ClassSidebar classId={classId} />
      </div>

      {/* Mobile: Overlay sidebar when needed */}
      <div className="md:hidden">
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
            <ClassSidebar classId={classId} />
          </>
        )}
      </div>

      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          "pt-14 sm:pt-16 bg-background",
          "md:ml-16",
          sidebarOpen && "md:ml-64",
          "ml-0"
        )}
      >
        <div className="p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </>
  )
}