"use client"

import React from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { SettingsSidebar } from './SettingsSidebar'
import { ProfileSettingsPanel } from './panels/ProfileSettingsPanel'
import { SecuritySettingsPanel } from './panels/SecuritySettingsPanel'
import { SystemSettingsPanel } from './panels/SystemSettingsPanel'

export type SettingsTab = 'profile' | 'security' | 'system'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  activeTab: SettingsTab
}

export const SettingsModal = ({ open, onClose, activeTab }: SettingsModalProps) => {
  const t = useTranslations()
  const [tab, setTab] = React.useState<SettingsTab>(activeTab)

  React.useEffect(() => {
    setTab(activeTab)
  }, [activeTab])

  const handleSelect = (next: SettingsTab) => {
    setTab(next)
    window.location.hash = `settings/${next}`
  }

  const renderPanel = () => {
    switch (tab) {
      case 'profile':
        return <ProfileSettingsPanel />
      case 'security':
        return <SecuritySettingsPanel />
      case 'system':
        return <SystemSettingsPanel />
      default:
        return <ProfileSettingsPanel />
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="w-full max-w-modal-lg p-0 max-h-[90vh] overflow-hidden">
        {/* Accessible title for screen readers */}
        <DialogTitle className="sr-only">{t('settings')}</DialogTitle>
        {/* Responsive layout: stack on mobile, side-by-side on larger screens */}
        <div className="flex flex-col sm:flex-row h-auto sm:h-modal max-h-[85vh]">
          <SettingsSidebar active={tab} onSelect={handleSelect} />
          <div className="flex-1 border-t sm:border-t-0 sm:border-l border-border overflow-hidden">
            <div className="h-full overflow-auto p-4 sm:p-6">
              {renderPanel()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
