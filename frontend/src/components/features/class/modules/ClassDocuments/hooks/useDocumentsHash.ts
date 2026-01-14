'use client'

import { useCallback, useEffect, useState } from 'react'

const UPLOAD_MODAL_HASH = 'upload-document'

const parseHash = () => {
  if (typeof window === 'undefined') {
    return false
  }
  return window.location.hash.replace('#', '') === UPLOAD_MODAL_HASH
}

const clearHash = () => {
  if (typeof window === 'undefined') return
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

export const useDocumentsHash = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => setIsUploadModalOpen(parseHash())
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const openUploadModal = useCallback(() => {
    if (typeof window === 'undefined') return
    window.location.hash = UPLOAD_MODAL_HASH
    setIsUploadModalOpen(true)
  }, [])

  const closeUploadModal = useCallback(() => {
    clearHash()
    setIsUploadModalOpen(false)
  }, [])

  const handleModalToggle = useCallback(
    (open: boolean) => {
      if (open) {
        openUploadModal()
      } else {
        closeUploadModal()
      }
    },
    [closeUploadModal, openUploadModal]
  )

  return {
    isUploadModalOpen,
    openUploadModal,
    closeUploadModal,
    handleModalToggle,
  }
}
