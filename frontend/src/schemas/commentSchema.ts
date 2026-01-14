import { z } from 'zod'

export const commentSchema = z.object({
  content: z.string()
    .min(1, 'comment_content_required')
    .max(5000, 'comment_content_max_length'),
})

export type CommentFormData = z.infer<typeof commentSchema>
