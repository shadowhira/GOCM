"use client"

import { useCallback, useEffect, useState } from 'react'
import type { ShopItemHashState } from '../types'

const parseHash = (): ShopItemHashState => {
  if (typeof window === 'undefined') {
    return { mode: 'none' }
  }

  const rawHash = window.location.hash.replace('#', '')

  if (rawHash === 'create-shop-item') {
    return { mode: 'create' }
  }

  if (rawHash.startsWith('edit-shop-item-')) {
    const id = Number(rawHash.replace('edit-shop-item-', ''))
    return Number.isNaN(id) ? { mode: 'none' } : { mode: 'edit', shopItemId: id }
  }

  if (rawHash.startsWith('delete-shop-item-')) {
    const id = Number(rawHash.replace('delete-shop-item-', ''))
    return Number.isNaN(id) ? { mode: 'none' } : { mode: 'delete', shopItemId: id }
  }

  return { mode: 'none' }
}

const clearHash = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

export const useAdminShopItemsHash = () => {
  const [hashState, setHashState] = useState<ShopItemHashState>({ mode: 'none' })

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
    if (typeof window === 'undefined') {
      return
    }

    window.location.hash = 'create-shop-item'
  }, [])

  const openEdit = useCallback((shopItemId: number) => {
    if (typeof window === 'undefined') {
      return
    }

    window.location.hash = `edit-shop-item-${shopItemId}`
  }, [])

  const openDelete = useCallback((shopItemId: number) => {
    if (typeof window === 'undefined') {
      return
    }

    window.location.hash = `delete-shop-item-${shopItemId}`
  }, [])

  return {
    hashState,
    openCreate,
    openEdit,
    openDelete,
    close,
  }
}
