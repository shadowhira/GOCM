/**
 * PostForm - Form nội dung (title, content, attachments) cho tạo/chỉnh sửa Post.
 * Single responsibility: render form fields & trigger submit.
 * Logic submit/permissions nằm ở `PostModal`.
 */
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileUpload, type UploadedFileItem } from '@/components/features/uploadFile'
import type { PostFormData } from '@/schemas/postSchema'
import { cn } from '@/lib/utils'

export interface PostFormProps {
  mode: 'create' | 'edit'
  form: UseFormReturn<PostFormData>
  onSubmit: (data: PostFormData) => Promise<void>
  onClose: () => void
  classId: number
  onFilesChange: (files: UploadedFileItem[]) => void
  initialFiles?: UploadedFileItem[]
}

export const PostForm: React.FC<PostFormProps> = ({
  mode,
  form,
  onSubmit,
  onClose,
  classId,
  onFilesChange,
  initialFiles = [],
}) => {
  const t = useTranslations()
  const { register, handleSubmit, formState } = form
  const { errors, isSubmitting } = formState
  const [files, setFiles] = React.useState<UploadedFileItem[]>(initialFiles)
  const watch = form.watch
  const title = watch('title')
  const content = watch('content')

  // Kiểm tra điều kiện enable nút submit
  const canSubmit =
    (!isSubmitting && (
      (title && title.trim().length > 0) ||
      (content && content.trim().length > 0) ||
      (files && files.length > 0)
    ))

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            {t('post_title')}
          </label>
          <Input
            id="title"
            placeholder={t('post_title_placeholder')}
            {...register('title')}
            disabled={isSubmitting}
          />
          {errors.title?.message && (
            <p className="text-sm text-destructive">
              {t(errors.title.message as string)}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            {t('post_content')}
          </label>
          <textarea
            id="content"
            placeholder={t('post_content_placeholder')}
            {...register('content')}
            disabled={isSubmitting}
            rows={8}
            className={cn(
              'flex w-full rounded-md border px-3 py-2 text-base ring-offset-ring focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
            )}
          />
          {errors.content?.message && (
            <p className="text-sm text-destructive">
              {t(errors.content.message as string)}
            </p>
          )}
        </div>

        {/* File Attachments - Sử dụng FileUpload component */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('post_attachments')}</label>
          <FileUpload
            action={`/Document`}
            method="post"
            multiple
            accept="*/*"
            maxSizeMB={50}
            showPreview={false}
            disabled={isSubmitting}
            onFilesChange={(newFiles) => {
              setFiles(newFiles)
              onFilesChange(newFiles)
            }}
            initialFiles={initialFiles}
            buildFormData={(file) => {
              const formData = new FormData()
              // Gửi file lên với ParentType.POST
              formData.append('File', file)
              formData.append('ClassId', String(classId))
              formData.append('ParentType', '1') // ParentType.POST = 1
              return formData
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
          >
            {isSubmitting
              ? t(mode === 'create' ? 'creating_post' : 'updating_post')
              : t(mode === 'create' ? 'create_post' : 'update_post')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
