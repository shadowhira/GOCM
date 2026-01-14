'use client'

import { useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouterWithProgress } from '@/hooks/useRouterWithProgress'
import { useGetClassById, useUpdateClass, useDeleteClass, useLeaveClass } from '@/queries/classQueries'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClassSchema, type CreateClassFormData } from '@/schemas/classSchema'
import { toast } from 'sonner'
import { useCurrentUser } from '@/store/auth/useAuthStore'
import { RoleInClass } from '@/types/class'
import { GeneralSettingsForm } from './parts/GeneralSettingsForm'
import { EnrollmentSettings } from './parts/EnrollmentSettings'
import { DeleteClassCard } from './parts/DeleteClassCard'
import { LeaveClassCard } from './parts/LeaveClassCard'
import { AppearanceSettingsCard } from './parts/AppearanceSettingsCard'
import { CoverSettingsCard } from './parts/CoverSettingsCard'

interface ClassSettingsProps {
  classId: string
}

export const ClassSettings = ({ classId }: ClassSettingsProps) => {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouterWithProgress()
  const currentUser = useCurrentUser()

  const classIdNumber = Number.parseInt(classId, 10)
  const { data: classData, isLoading } = useGetClassById(classIdNumber)
  const { mutateAsync: updateClass, isPending: isUpdating } = useUpdateClass()
  const { mutateAsync: deleteClass, isPending: isDeleting } = useDeleteClass()
  const { mutateAsync: leaveClass, isPending: isLeaving } = useLeaveClass()

  const form = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  // Sync form with fetched data
  useEffect(() => {
    if (classData) {
      form.reset({
        name: classData.name ?? '',
        description: classData.description ?? ''
      })
    }
  }, [classData, form])

  const isTeacher = !!classData && !!currentUser && (
    classData.userRoleInClass === RoleInClass.TEACHER ||
    classData.createdByUserId === currentUser.id
  )

  const isStudent = !!classData && !!currentUser && (
    classData.userRoleInClass === RoleInClass.STUDENT
  )

  const onSubmit = async (values: CreateClassFormData) => {
    try {
      await updateClass({ id: classIdNumber, data: { name: values.name, description: values.description } })
      toast.success(t('saved_successfully'))
    } catch {
      toast.error(t('save_failed'))
    }
  }

  const handleCopyJoinCode = async () => {
    if (!classData?.joinCode) return
    try {
      await navigator.clipboard.writeText(classData.joinCode)
      toast.success(t('copied_to_clipboard'))
    } catch {
      toast.error(t('copy_failed'))
    }
  }

  const handleDelete = async () => {
    if (!currentUser) return
    try {
      await deleteClass(classIdNumber)
      toast.success(t('class_deleted'))
      router.push(`/${locale}`)
    } catch {
      toast.error(t('delete_failed'))
    }
  }

  const handleLeave = async () => {
    if (!currentUser) return
    try {
      await leaveClass(classIdNumber)
      toast.success(t('left_class_successfully'))
      router.push(`/${locale}`)
    } catch {
      toast.error(t('leave_failed'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            {t('sidebar_settings')}
          </h1>
          <p className="text-muted-foreground">
            {t('configure_class_settings')}
          </p>
        </div>
      </div>

      {/* General settings */}
      {isTeacher && (
        <GeneralSettingsForm
          form={form}
          onSubmit={onSubmit}
          isSaving={isUpdating}
          isLoading={isLoading}
        />
      )}

      {/* Cover settings */}
      {isTeacher && <CoverSettingsCard classId={classIdNumber} isTeacher={isTeacher} />}

      {/* Appearance settings */}
      {isTeacher && <AppearanceSettingsCard classId={classIdNumber} isTeacher={isTeacher} />}

      {/* Enrollment settings */}
      <EnrollmentSettings joinCode={classData?.joinCode} onCopyJoinCode={handleCopyJoinCode} />

      {/* Delete and leave class */}
      {isTeacher && (
        <DeleteClassCard isDeleting={isDeleting} onDelete={handleDelete} />
      )}
      {isStudent && (
        <LeaveClassCard isLeaving={isLeaving} onLeave={handleLeave} />
      )}
    </div>
  )
}