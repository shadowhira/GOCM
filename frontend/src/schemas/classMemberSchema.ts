import { z } from 'zod'
import { RoleInClass } from '@/types/class'

export const updateClassMemberSchema = z.object({
  roleInClassValue: z.nativeEnum(RoleInClass, {
    message: 'member_role_required',
  }),
  points: z
    .number({ message: 'member_points_invalid' })
    .min(0, 'member_points_min'),
  enrollDate: z.string().min(1, 'member_enroll_date_required'),
})

export type UpdateClassMemberFormData = z.infer<typeof updateClassMemberSchema>
