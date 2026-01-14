'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Loader2, Pencil, Shield, Trash2, Users } from 'lucide-react'
import type { ClassMemberResponse } from '@/types/class'
import { useGetClassMembers, useRemoveMember, useUpdateClassMember } from '@/queries/classQueries'
import { ClassMemberEditModal } from './ClassMemberEditModal'
import type { UpdateClassMemberFormData } from '@/schemas/classMemberSchema'
import { getApiErrorMessage } from '@/lib/api-error'

interface ClassMembersPanelProps {
  classId?: number
}

export const ClassMembersPanel = ({ classId }: ClassMembersPanelProps) => {
  const t = useTranslations()
  const removeMemberMutation = useRemoveMember()
  const updateMemberMutation = useUpdateClassMember()
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [editingMember, setEditingMember] = useState<ClassMemberResponse | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<ClassMemberResponse | null>(null)

  const {
    data: members,
    isLoading,
    isError,
    refetch,
  } = useGetClassMembers(classId ?? 0)

  const groupedMembers = useMemo(() => {
    if (!members) {
      return { teachers: [], students: [] as ClassMemberResponse[] }
    }

    return {
      teachers: members.filter((member) => member.roleInClassValue === 0),
      students: members.filter((member) => member.roleInClassValue !== 0),
    }
  }, [members])

  const handleRemove = (memberId: number) => {
    if (!classId) {
      return
    }

    setRemovingId(memberId)
    removeMemberMutation.mutate(
      { classId, memberId },
      {
        onSuccess: () => {
          toast.success(t('member_removed_successfully'))
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, t('failed_to_remove_member'), t))
        },
        onSettled: () => {
          setRemovingId(null)
        },
      }
    )
  }

  const handleEdit = (member: ClassMemberResponse) => {
    setEditingMember(member)
  }

  const handleEditSubmit = (values: UpdateClassMemberFormData) => {
    if (!classId || !editingMember) {
      return
    }

    updateMemberMutation.mutate(
      {
        classId,
        memberId: editingMember.id,
        data: {
          roleInClass: values.roleInClassValue,
          points: values.points,
          enrollDate: values.enrollDate ? new Date(values.enrollDate).toISOString() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('member_updated_successfully'))
          setEditingMember(null)
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, t('failed_to_update_member'), t))
        },
      }
    )
  }

  if (!classId) {
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-48 rounded bg-muted" />
              </div>
              <div className="h-8 w-24 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t('something_went_wrong')}</AlertTitle>
        <AlertDescription>
          {t('failed_to_load_members')}
          <Button variant="link" className="ml-2 px-0" onClick={() => refetch()}>
            {t('try_again')}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!members || members.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <Users className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">{t('no_members_yet')}</p>
            <p className="text-sm text-muted-foreground">{t('invite_students_teachers')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderGroup = (title: string, data: ClassMemberResponse[]) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
        <Badge variant="outline">{data.length}</Badge>
      </div>
      <div className="space-y-3">
        {data.map((member) => (
          <div
            key={member.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card/80 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={member.avatarUrl || undefined} alt={member.userName} />
                <AvatarFallback className="bg-primary-500 text-white text-sm font-semibold">
                  {member.userName?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{member.userName}</p>
                <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                <p className="text-xs text-muted-foreground">
                  {t('member_since', { date: new Date(member.enrollDate).toLocaleDateString() })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('points')}: <span className="font-semibold text-foreground">{member.points}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {member.roleInClassValue === 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {t('teacher')}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleEdit(member)}
                disabled={updateMemberMutation.isPending && editingMember?.id === member.id}
              >
                {updateMemberMutation.isPending && editingMember?.id === member.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
                {t('edit_member')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive"
                disabled={removeMemberMutation.isPending && removingId === member.id}
                onClick={() => setMemberToRemove(member)}
              >
                {removeMemberMutation.isPending && removingId === member.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {t('remove_member')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        {renderGroup(t('teachers'), groupedMembers.teachers)}
        {renderGroup(t('students'), groupedMembers.students)}
      </div>

      <ClassMemberEditModal
        open={Boolean(editingMember)}
        member={editingMember ?? undefined}
        onClose={() => setEditingMember(null)}
        onSubmit={handleEditSubmit}
        isSubmitting={updateMemberMutation.isPending}
      />

      <AlertDialog open={Boolean(memberToRemove)} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_remove_member')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('remove_member_warning', {
                name: memberToRemove?.userName ?? t('unknown'),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMemberMutation.isPending}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToRemove) {
                  handleRemove(memberToRemove.id)
                  setMemberToRemove(null)
                }
              }}
              disabled={removeMemberMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {removeMemberMutation.isPending && removingId === memberToRemove?.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t('remove_member')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
