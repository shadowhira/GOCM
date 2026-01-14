'use client'

import { useCallback, useEffect, useState } from 'react'
import type { HashState } from '../types'

const parseHash = (): HashState => {
  if (typeof window === 'undefined') {
    return { mode: 'none' }
  }

  const rawHash = window.location.hash.replace('#', '')

  if (rawHash === 'create-user') {
    return { mode: 'create' }
  }

  if (rawHash.startsWith('edit-user-')) {
    const id = Number(rawHash.replace('edit-user-', ''))
    return Number.isNaN(id) ? { mode: 'none' } : { mode: 'edit', userId: id }
  }

  if (rawHash.startsWith('delete-user-')) {
    const id = Number(rawHash.replace('delete-user-', ''))
    return Number.isNaN(id) ? { mode: 'none' } : { mode: 'delete', userId: id }
  }

  return { mode: 'none' }
}

const clearHash = () => {
  if (typeof window === 'undefined') return
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

export const useAdminUsersHash = () => {
  const [hashState, setHashState] = useState<HashState>({ mode: 'none' })

  useEffect(() => {
    const syncHash = () => setHashState(parseHash())
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  const close = useCallback(() => {
    clearHash()
    setHashState({ mode: 'none' })
  }, [])

  const openCreate = useCallback(() => {
    if (typeof window === 'undefined') return
    window.location.hash = 'create-user'
  }, [])

  const openEdit = useCallback((userId: number) => {
    if (typeof window === 'undefined') return
    window.location.hash = `edit-user-${userId}`
  }, [])

  const openDelete = useCallback((userId: number) => {
    if (typeof window === 'undefined') return
    window.location.hash = `delete-user-${userId}`
  }, [])

  return {
    hashState,
    openCreate,
    openEdit,
    openDelete,
    close,
  }
}
