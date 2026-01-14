'use client'

import { useCallback, useEffect, useState } from 'react'

const ADD_DIALOG_HASH = 'class-store-add-items'

const parseHash = () => {
  if (typeof window === 'undefined') {
    return false
  }
  return window.location.hash.replace('#', '') === ADD_DIALOG_HASH
}

const clearHash = () => {
  if (typeof window === 'undefined') return
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

export const useClassStoreHash = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    const sync = () => setIsAddDialogOpen(parseHash())
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const openAddDialog = useCallback(() => {
    if (typeof window === 'undefined') return
    window.location.hash = ADD_DIALOG_HASH
    setIsAddDialogOpen(true)
  }, [])

  const closeAddDialog = useCallback(() => {
    clearHash()
    setIsAddDialogOpen(false)
  }, [])

  const handleDialogToggle = useCallback(
    (open: boolean) => {
      if (open) {
        openAddDialog()
      } else {
        closeAddDialog()
      }
    },
    [closeAddDialog, openAddDialog]
  )

  return {
    isAddDialogOpen,
    openAddDialog,
    closeAddDialog,
    handleDialogToggle,
  }
}
