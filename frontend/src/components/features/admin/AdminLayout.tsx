"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import { useUIStore } from '@/store/ui/useUIStore'
import { cn } from '@/lib/utils'

const AdminSidebar = dynamic(
  () => import('./AdminSidebar').then((mod) => mod.AdminSidebar),
  { ssr: false }  
)

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
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
            <AdminSidebar />
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