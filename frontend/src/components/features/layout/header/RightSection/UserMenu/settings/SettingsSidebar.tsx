"use client"

import React from 'react'
import { useTranslations } from 'next-intl'
import { User, Shield, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SettingsTab } from './SettingsModal'

interface SettingsSidebarProps {
  active: SettingsTab
  onSelect: (tab: SettingsTab) => void
}

export const SettingsSidebar = ({ active, onSelect }: SettingsSidebarProps) => {
  const t = useTranslations()

  const items: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'system', label: t('system'), icon: Settings },
  ]

  return (
    <aside className="w-full sm:w-56 p-2 sm:p-4 bg-muted/30 sm:bg-transparent">
      <div className="hidden sm:block text-sm font-semibold text-muted-foreground mb-2">
        {t('user_settings')}
      </div>
      <div className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors text-sm whitespace-nowrap flex-shrink-0',
                active === item.id 
                  ? 'bg-primary text-primary-foreground sm:bg-muted sm:text-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
