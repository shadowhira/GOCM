import { z } from 'zod'

/**
 * Post schemas for form validation
 * Following RHF + Zod pattern from ARCHITECTURE_STANDARDS.md
 */


export const postSchema = z.object({
  title: z
    .string()
    .max(200, 'post_title_max_length'),
  content: z
    .string()
    .max(5000, 'post_content_max_length'),
})

export type PostFormData = z.infer<typeof postSchema>
