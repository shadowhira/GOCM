import { z } from "zod";

/**
 * Authentication schemas for form validation
 * Following RHF + Zod pattern from ARCHITECTURE_STANDARDS.md
 */

export const loginSchema = z.object({
  email: z.string().min(1, "email_required").email("email_invalid"),
  password: z
    .string()
    .min(1, "password_required")
    .min(6, "password_min_length"),
});

export const registerSchema = z
  .object({
    email: z.string().min(1, "email_required").email("email_invalid"),
    password: z
      .string()
      .min(1, "password_required")
      .min(6, "password_min_length")
      .max(50, "password_max_length"),
    confirmPassword: z.string().min(1, "confirm_password_required"),
    displayName: z
      .string()
      .min(1, "display_name_required")
      .min(2, "display_name_min_length")
      .max(50, "display_name_max_length"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords_do_not_match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "email_required").email("email_invalid"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "password_required")
      .min(6, "password_min_length")
      .max(50, "password_max_length"),
    confirmPassword: z.string().min(1, "confirm_password_required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords_do_not_match",
    path: ["confirmPassword"],
  });

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
