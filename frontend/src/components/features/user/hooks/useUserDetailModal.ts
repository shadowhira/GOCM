'use client'

import { useState, useCallback } from 'react'
import type { UserBasicInfo, UserClassContext } from '../UserDetailModal/types'

interface UseUserDetailModalReturn {
  /** Whether the modal is open */
  isOpen: boolean
  /** The currently selected user */
  selectedUser: UserBasicInfo | null
  /** The class context for the selected user */
  classContext: UserClassContext | null
  /** Open the modal with user data */
  openModal: (user: UserBasicInfo, classContext?: UserClassContext | null) => void
  /** Close the modal */
  closeModal: () => void
  /** Toggle modal open state */
  setIsOpen: (open: boolean) => void
}

/**
 * Hook to manage UserDetailModal state
 * 
 * @example
 * ```tsx
 * const { isOpen, selectedUser, classContext, openModal, closeModal, setIsOpen } = useUserDetailModal()
 * 
 * // Open modal with user data
 * openModal({ id: 1, displayName: 'John', email: 'john@example.com' })
 * 
 * // Open modal with class context
 * openModal(
 *   { id: 1, displayName: 'John', email: 'john@example.com' },
 *   { classId: 1, classMemberId: 5, roleInClass: RoleInClass.STUDENT, ... }
 * )
 * ```
 */
export const useUserDetailModal = (): UseUserDetailModalReturn => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserBasicInfo | null>(null)
  const [classContext, setClassContext] = useState<UserClassContext | null>(null)

  const openModal = useCallback(
    (user: UserBasicInfo, context?: UserClassContext | null) => {
      setSelectedUser(user)
      setClassContext(context ?? null)
      setIsOpen(true)
    },
    []
  )

  const closeModal = useCallback(() => {
    setIsOpen(false)
    // Delay clearing data to allow close animation
    setTimeout(() => {
      setSelectedUser(null)
      setClassContext(null)
    }, 200)
  }, [])

  const handleSetIsOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        closeModal()
      } else {
        setIsOpen(true)
      }
    },
    [closeModal]
  )

  return {
    isOpen,
    selectedUser,
    classContext,
    openModal,
    closeModal,
    setIsOpen: handleSetIsOpen,
  }
}
