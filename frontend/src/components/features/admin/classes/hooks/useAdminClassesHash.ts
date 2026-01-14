'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ClassHashState } from '../types'

const parseHash = (): ClassHashState => {
  if (typeof window === 'undefined') {
    return { mode: 'none' }
  }

  const rawHash = window.location.hash.replace('#', '')

  if (rawHash === 'create-class') {
    return { mode: 'create' }
  }

  if (rawHash.startsWith('edit-class-')) {
    const id = Number(rawHash.replace('edit-class-', ''))
    return Number.isNaN(id) ? { mode: 'none' } : { mode: 'edit', classId: id }
  }

  if (rawHash.startsWith('delete-class-')) {
    const id = Number(rawHash.replace('delete-class-', ''))
    return Number.isNaN(id) ? { mode: 'none' } : { mode: 'delete', classId: id }
  }

  if (rawHash.startsWith('view-class-')) {
    const id = Number(rawHash.replace('view-class-', ''))
    return Number.isNaN(id) ? { mode: 'none' } : { mode: 'details', classId: id }
  }

  return { mode: 'none' }
}

const clearHash = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

export const useAdminClassesHash = () => {
  const [hashState, setHashState] = useState<ClassHashState>({ mode: 'none' })

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
    window.location.hash = 'create-class'
  }, [])

  const openEdit = useCallback((classId: number) => {
    if (typeof window === 'undefined') return
    window.location.hash = `edit-class-${classId}`
  }, [])

  const openDelete = useCallback((classId: number) => {
    if (typeof window === 'undefined') return
    window.location.hash = `delete-class-${classId}`
  }, [])

  const openDetails = useCallback((classId: number) => {
    if (typeof window === 'undefined') return
    window.location.hash = `view-class-${classId}`
  }, [])

  return {
    hashState,
    openCreate,
    openEdit,
    openDelete,
    openDetails,
    close,
  }
}
