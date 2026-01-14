/**
 * Modal wrapper cho PostForm
 */
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCurrentUser } from '@/store/auth'
import { useCreatePost, useUpdatePost } from '@/queries/postQueries'
import { postSchema, type PostFormData } from '@/schemas/postSchema'
import { PostStatus, type PostResponse } from '@/types/post'
import { PostForm } from './PostForm'
import type { UploadedFileItem } from '@/components/features/uploadFile'
import { getApiErrorMessage } from '@/lib/api-error'

interface PostModalProps {
  mode: 'create' | 'edit'
  open: boolean
  onClose: () => void
  classId: number
  classMemberId?: number
  post?: PostResponse
}

export const PostModal = ({
  mode,
  open,
  onClose,
  classId,
  classMemberId,
  post,
}: PostModalProps) => {
  const t = useTranslations()
  const currentUser = useCurrentUser()
  const createPostMutation = useCreatePost()
  const updatePostMutation = useUpdatePost()

  // State cho uploaded files
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFileItem[]>([])

  // Form setup (RHF + Zod)
  const form = useForm<PostFormData>({
  resolver: zodResolver(postSchema),
    defaultValues: mode === 'edit' && post
      ? { title: post.title, content: post.content }
      : { title: '', content: '' },
  })

  const { reset, formState: { isSubmitting } } = form

  // Prefill: khi edit, điền sẵn dữ liệu và hiển thị file cũ
  React.useEffect(() => {
    if (mode === 'edit' && open && post) {
      // Reset form values to current post data
      reset({ title: post.title || '', content: post.content || '' })

      // Map existing documents to UploadedFileItem
      const initial: UploadedFileItem[] = (post.documents || []).map((doc) => ({
        id: String(doc.id),
        publicUrl: doc.publicUrl,
        documentId: doc.id,
        fileName: doc.fileName,
      }))
      setUploadedFiles(initial)
    }
  }, [mode, open, post, reset])

  // Submit handler
  const onSubmit = async (data: PostFormData) => {
    // Get documentIds from uploaded files
    const documentIds = uploadedFiles
      .filter(f => f.documentId)
      .map(f => f.documentId!)

    if (mode === 'create') {
      // Validate for create mode
      if (!currentUser?.id) {
        toast.error(t('please_login_first'))
        return
      }
      if (!classMemberId) {
        toast.error(t('class_member_id_required'))
        return
      }

      try {
        await createPostMutation.mutateAsync({
          title: data.title,
          content: data.content,
          classIds: [classId],
          createdByClassMemberId: classMemberId,
          status: PostStatus.PUBLISHED,
          documentIds: documentIds.length > 0 ? documentIds : undefined,
        })

        toast.success(t('post_created_success'))
        handleClose()
      } catch (error) {
        toast.error(getApiErrorMessage(error, t('post_create_failed'), t))
      }
    } else {
      // Edit mode
      if (!post) return

      try {
        await updatePostMutation.mutateAsync({
          id: post.id,
          title: data.title,
          content: data.content,
          status: PostStatus.PUBLISHED,
          documentIds: documentIds.length > 0 ? documentIds : undefined,
        })

        toast.success(t('post_updated_success'))
        handleClose()
      } catch (error) {
        toast.error(getApiErrorMessage(error, t('post_update_failed'), t))
      }
    }
  }

  // Close handler
  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      setUploadedFiles([])
      onClose()
    }
  }

  // Handle files change from FileUpload component
  const handleFilesChange = (files: UploadedFileItem[]) => {
    setUploadedFiles(files)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
  <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('create_post') : t('edit_post')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? t('create_post_description') : t('edit_post_description')}
          </DialogDescription>
        </DialogHeader>
        <PostForm
          mode={mode}
          form={form}
          onSubmit={onSubmit}
          onClose={handleClose}
          classId={classId}
          onFilesChange={handleFilesChange}
          initialFiles={uploadedFiles}
        />
      </DialogContent>
    </Dialog>
  )
}
