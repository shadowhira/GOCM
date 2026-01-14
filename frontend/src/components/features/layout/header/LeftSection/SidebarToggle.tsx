'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/ui/useUIStore'

export const SidebarToggle = () => {
  const { toggleSidebar } = useUIStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="h-9 w-9"
    >
      <Menu className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}