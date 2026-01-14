'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGetClassMembers, useGetClassById, useRemoveMember, useUpdateClassMember } from '@/queries/classQueries'
import { useTranslations } from 'next-intl'
import { RoleInClass, type ClassMemberResponse } from '@/types/class'
import { MembersHeader } from './parts/MembersHeader'
import { MembersFilters } from './parts/MembersFilters'
import { MembersTable } from './parts/MembersTable'
import { EmptyState } from './parts/EmptyState'
import { useCurrentUser } from '@/store/auth/useAuthStore'
import { useHydrateCosmeticsFromMembers, useSetClassAppearanceSettings } from '@/store'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LeaderboardTable, type LeaderboardEntry } from './parts/LeaderboardTable'
import { InviteMembersModal } from './parts/InviteMembersModal'
import { getApiErrorMessage } from '@/lib/api-error'
import { EditMemberRoleDialog } from './parts/EditMemberRoleDialog'

const INVITE_MODAL_HASH = '#invite-members'

interface ClassMembersProps {
  classId: string
}

export const ClassMembers = ({ classId }: ClassMembersProps) => {
  const t = useTranslations()
  const currentUser = useCurrentUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'student'>('all')
  const [activeTab, setActiveTab] = useState<'members' | 'leaderboard'>('members')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editingMember, setEditingMember] = useState<ClassMemberResponse | null>(null)

  const classIdNum = parseInt(classId)

  // Fetch members and class data
  const { data: members = [], isLoading, isError } = useGetClassMembers(classIdNum)
  const { data: classData } = useGetClassById(classIdNum)
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember()
  const { mutate: updateMember, isPending: isUpdating } = useUpdateClassMember()
  const hydrateCosmetics = useHydrateCosmeticsFromMembers()
  const setClassAppearanceSettings = useSetClassAppearanceSettings()

  useEffect(() => {
    if (classData?.appearanceSettings) {
      setClassAppearanceSettings(classIdNum, classData.appearanceSettings)
    }
  }, [classData?.appearanceSettings, classIdNum, setClassAppearanceSettings])

  useEffect(() => {
    if (classIdNum && members.length > 0) {
      hydrateCosmetics(classIdNum, members)
    }
  }, [classIdNum, hydrateCosmetics, members])

  // Check if current user is teacher or owner
  const currentUserMember = useMemo(() => 
    members.find(m => m.userId === currentUser?.id),
    [members, currentUser]
  )

  const isTeacher = currentUserMember?.roleInClassValue === RoleInClass.TEACHER
  const isOwner = classData?.createdByUserId === currentUser?.id
  const canManageMembers = isTeacher || isOwner

  // Filter members based on search and role
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search filter
      const matchesSearch = 
        member.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.userEmail.toLowerCase().includes(searchQuery.toLowerCase())

      // Role filter
      const matchesRole = 
        roleFilter === 'all' || 
        (roleFilter === 'teacher' && member.roleInClassValue === RoleInClass.TEACHER) ||
        (roleFilter === 'student' && member.roleInClassValue === RoleInClass.STUDENT)

      return matchesSearch && matchesRole
    })
  }, [members, searchQuery, roleFilter])

  // Separate teachers and students
  const teachers = useMemo(() => 
    filteredMembers.filter(m => m.roleInClassValue === RoleInClass.TEACHER),
    [filteredMembers]
  )
  
  const students = useMemo(() => 
    filteredMembers.filter(m => m.roleInClassValue === RoleInClass.STUDENT),
    [filteredMembers]
  )

  const leaderboardMembers: LeaderboardEntry[] = useMemo(() => {
    return members
      .filter((member) => member.roleInClassValue === RoleInClass.STUDENT)
      .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
      .map((member, index) => ({ ...member, rank: index + 1 }))
  }, [members])

  const currentUserLeaderboardEntry = useMemo(() => {
    if (!currentUser) return null
    return leaderboardMembers.find((member) => member.userId === currentUser.id) ?? null
  }, [currentUser, leaderboardMembers])

  useEffect(() => {
    const syncInviteModal = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      setShowInviteModal(hash === INVITE_MODAL_HASH)
    }

    syncInviteModal()
    window.addEventListener('hashchange', syncInviteModal)
    return () => window.removeEventListener('hashchange', syncInviteModal)
  }, [])

  const handleInvite = () => {
    if (typeof window === 'undefined') return
    window.location.hash = INVITE_MODAL_HASH
  }

  const handleCloseInviteModal = () => {
    if (typeof window === 'undefined') return
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setShowInviteModal(false)
  }

  const handleRetry = () => {
    window.location.reload()
  }

  const handleRemoveMember = (memberId: number) => {
    if (isRemoving) return

    removeMember(
      { classId: classIdNum, memberId },
      {
        onSuccess: () => {
          toast.success(t('member_removed_successfully'))
        },
        onError: (error: Error) => {
          toast.error(getApiErrorMessage(error, t('failed_to_remove_member'), t))
        }
      }
    )
  }

  const handleOpenEditRole = (member: ClassMemberResponse) => {
    setEditingMember(member)
  }

  const handleCloseEditRole = () => {
    if (isUpdating) return
    setEditingMember(null)
  }

  const handleSubmitEditRole = (role: RoleInClass) => {
    if (!editingMember) return

    updateMember(
      {
        classId: classIdNum,
        memberId: editingMember.id,
        data: {
          roleInClass: role,
          points: editingMember.points,
          enrollDate: editingMember.enrollDate ? new Date(editingMember.enrollDate).toISOString() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('member_updated_successfully'))
          setEditingMember(null)
        },
        onError: (error: Error) => {
          toast.error(getApiErrorMessage(error, t('failed_to_update_member'), t))
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <MembersHeader 
        totalMembers={members.length} 
        onInvite={handleInvite}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'members' | 'leaderboard')}>
        <TabsList className="mb-4 rounded-md border border-border">
          <TabsTrigger value="members">{t('class_members')}</TabsTrigger>
          <TabsTrigger value="leaderboard">{t('leaderboard')}</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <MembersFilters
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            onSearchChange={setSearchQuery}
            onRoleFilterChange={setRoleFilter}
          />

          {isLoading && <EmptyState type="loading" />}

          {isError && <EmptyState type="error" onRetry={handleRetry} />}

          {!isLoading && !isError && filteredMembers.length === 0 && (
            <EmptyState 
              type={searchQuery || roleFilter !== 'all' ? 'no-results' : 'empty'} 
            />
          )}

          {!isLoading && !isError && teachers.length > 0 && (
            <MembersTable 
              title={t('teachers')}
              members={teachers}
              iconColor="text-accent-600"
              canRemove={canManageMembers}
              canEditRole={canManageMembers}
              ownerId={classData?.createdByUserId}
              onRemoveMember={handleRemoveMember}
              onEditRole={handleOpenEditRole}
              classId={classIdNum}
            />
          )}

          {!isLoading && !isError && students.length > 0 && (
            <MembersTable 
              title={t('students')}
              members={students}
              iconColor="text-primary-600"
              canRemove={canManageMembers}
              canEditRole={canManageMembers}
              ownerId={classData?.createdByUserId}
              onRemoveMember={handleRemoveMember}
              onEditRole={handleOpenEditRole}
              classId={classIdNum}
            />
          )}
        </TabsContent>

        <TabsContent value="leaderboard">
          {isLoading && <EmptyState type="loading" />}
          {isError && <EmptyState type="error" onRetry={handleRetry} />}
          {!isLoading && !isError && (
            <LeaderboardTable 
              members={leaderboardMembers}
              currentUserId={currentUser?.id}
              currentUserEntry={currentUserLeaderboardEntry}
              classId={classIdNum}
            />
          )}
        </TabsContent>
      </Tabs>

      <InviteMembersModal 
        open={showInviteModal}
        onClose={handleCloseInviteModal}
        joinCode={classData?.joinCode}
        classId={classIdNum}
      />

      <EditMemberRoleDialog
        open={Boolean(editingMember)}
        member={editingMember}
        onClose={handleCloseEditRole}
        onSubmit={handleSubmitEditRole}
        isSubmitting={isUpdating}
      />
    </div>
  )
}