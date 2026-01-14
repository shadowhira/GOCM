import { z } from "zod";

// Student Average Grade Schema
export const studentAverageGradeSchema = z
  .object({
    studentId: z
      .number()
      .int()
      .positive("Student ID must be a positive integer"),
    studentName: z.string().min(1, "Student name is required"),
    studentAvatarUrl: z.preprocess((val) => {
      // Convert empty string or null to undefined so the optional url check passes
      if (val === "" || val === null) return undefined;
      return val;
    }, z.string().url().optional()),
    averageScore: z
      .number()
      .min(0, "Average score must be at least 0")
      .max(100, "Average score cannot exceed 100"),
    totalAssignments: z
      .number()
      .int()
      .min(0, "Total assignments must be at least 0"),
    submittedCount: z
      .number()
      .int()
      .min(0, "Submitted count must be at least 0"),
    gradedCount: z.number().int().min(0, "Graded count must be at least 0"),
  })
  .refine((data) => data.gradedCount <= data.submittedCount, {
    message: "Graded count cannot exceed submitted count",
    path: ["gradedCount"],
  })
  .refine((data) => data.submittedCount <= data.totalAssignments, {
    message: "Submitted count cannot exceed total assignments",
    path: ["submittedCount"],
  });

// Array of student average grades
export const studentAverageGradesSchema = z.array(studentAverageGradeSchema);

// Grade filter/sort schema for UI state
export const gradeFilterSchema = z
  .object({
    search: z.string().optional(),
    minScore: z.number().min(0).max(100).optional(),
    maxScore: z.number().min(0).max(100).optional(),
    sortBy: z.enum(["name", "score", "submitted", "graded"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .refine(
    (data) => {
      if (data.minScore !== undefined && data.maxScore !== undefined) {
        return data.minScore <= data.maxScore;
      }
      return true;
    },
    {
      message: "Minimum score cannot be greater than maximum score",
      path: ["minScore"],
    }
  );

// Grade status helper
export const gradeStatusSchema = z.enum([
  "excellent",
  "good",
  "average",
  "poor",
  "not-graded",
]);

// Create/Update grade schema (for teacher grading)
export const createGradeSchema = z.object({
  score: z
    .number()
    .min(0, "Score must be at least 0")
    .max(100, "Score cannot exceed 100"),
  feedback: z
    .string()
    .max(1000, "Feedback must be less than 1000 characters")
    .optional(),
});

export const updateGradeSchema = createGradeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// Type exports
export type StudentAverageGrade = z.infer<typeof studentAverageGradeSchema>;
export type StudentAverageGrades = z.infer<typeof studentAverageGradesSchema>;
export type GradeFilter = z.infer<typeof gradeFilterSchema>;
export type GradeStatus = z.infer<typeof gradeStatusSchema>;
export type CreateGrade = z.infer<typeof createGradeSchema>;
export type UpdateGrade = z.infer<typeof updateGradeSchema>;