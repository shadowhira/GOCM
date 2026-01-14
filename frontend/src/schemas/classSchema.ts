import { z } from "zod";

/**
 * Class schemas for form validation
 * Following RHF + Zod pattern from ARCHITECTURE_STANDARDS.md
 */

export const createClassSchema = z.object({
  name: z
    .string()
    .min(1, "class_name_required")
    .min(3, "class_name_min_length")
    .max(100, "class_name_max_length"),
  description: z.string().max(500, "description_max_length").optional(),
});

export const editClassSchema = z.object({
  name: z
    .string()
    .min(1, "class_name_required")
    .min(3, "class_name_min_length")
    .max(100, "class_name_max_length"),
  description: z.string().max(500, "description_max_length").optional(),
  coverColor: z.string().optional(),
  // Appearance settings
  showAvatarFrames: z.boolean().optional(),
  showChatFrames: z.boolean().optional(),
  showBadges: z.boolean().optional(),
});

export const joinClassSchema = z.object({
  joinCode: z
    .string()
    .min(1, "join_code_required")
    .length(6, "join_code_length"),
});

export type CreateClassFormData = z.infer<typeof createClassSchema>;
export type EditClassFormData = z.infer<typeof editClassSchema>;
export type JoinClassFormData = z.infer<typeof joinClassSchema>;
