"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useRouterWithProgress } from '@/hooks/useRouterWithProgress'
import { useUIStore } from '@/store/ui/useUIStore'
import { useTranslations, useLocale } from 'next-intl'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Layers,
} from 'lucide-react'

interface SidebarItem {
  key: string
  icon: React.ComponentType<{ className?: string }>
  translationKey: string
  href: string
}

export const AdminSidebar = () => {
  const router = useRouterWithProgress()
  const pathname = usePathname()
  const { sidebarOpen } = useUIStore()
  const t = useTranslations()
  const locale = useLocale()
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Determine if sidebar should show expanded content
  // On mobile: only when explicitly toggled open
  // On desktop: when toggled open OR hovered (if not explicitly toggled)
  const showExpanded = isMobile ? sidebarOpen : (sidebarOpen || isHovered)

  const sidebarItems: SidebarItem[] = [
    {
      key: 'dashboard',
      icon: LayoutDashboard,
      translationKey: 'admin_dashboard',
      href: '/admin',
    },
    {
      key: 'users',
      icon: Users,
      translationKey: 'admin_users',
      href: '/admin/users',
    },
    {
      key: 'classes',
      icon: Layers,
      translationKey: 'admin_classes',
      href: '/admin/classes',
    },
    {
      key: 'shop-items',
      icon: ShoppingBag,
      translationKey: 'admin_shop_items',
      href: '/admin/shop-items',
    },
  ]

  const handleItemClick = (item: SidebarItem) => {
    const prefix = `/${locale}`
    router.push(`${prefix}${item.href}`)
  }

  const isActiveItem = (item: SidebarItem) => {
    const prefix = `/${locale}`
    const normalizedPath = pathname?.startsWith(prefix)
      ? pathname.slice(prefix.length) || '/'
      : pathname || '/'
    if (item.key === 'dashboard') {
      return normalizedPath === '/admin'
    }
    return normalizedPath.startsWith(item.href)
  }

  return (
    <aside
      className={cn(
        "fixed left-0 bg-card border-r border-border transition-all duration-300 ease-in-out shadow-lg",
        // Mobile: Positioned below header when open, hidden when closed
        isMobile && !sidebarOpen && "hidden",
        isMobile && sidebarOpen && "top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-64 z-50",
        // Desktop: Always visible, positioned below header
        !isMobile && "top-16 h-[calc(100vh-4rem)] md:block",
        !isMobile && (showExpanded ? "md:w-64 md:z-50" : "md:w-16 md:z-40")
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Content */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveItem(item)
            
            return (
              <Button
                key={item.key}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full justify-start gap-3 h-10 relative overflow-hidden transition-colors",
                  isActive && "bg-primary-600 text-white shadow-sm hover:bg-primary-700",
                  !isActive && "text-foreground hover:bg-muted hover:text-foreground",
                  !showExpanded && "px-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "flex-1 text-left transition-opacity duration-200",
                  showExpanded ? "opacity-100" : "opacity-0"
                )}>
                  {t(item.translationKey)}
                </span>
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
