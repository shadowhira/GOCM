import { z } from "zod";
import { fileUploadSchema } from "./assignmentSchema";
import { AssignmentType } from "@/types/constants";
import { t } from "@/lib/i18n-zod";

// Quiz answer for CreateSubmissionRequest
export const createQuizAnswerSchema = z.object({
  quizQuestionId: z.number(),
  selectedOptionIds: z.array(z.number()).min(1, t("selectOneOption")),
  // Client may not know correctness; default to false and let backend compute
  isCorrect: z.boolean().optional().default(false),
  timeSpent: z.number().min(0, t("timeSpentMin")).default(0),
  answeredAt: z.date().refine((date) => !isNaN(date.getTime()), {
    message: t("answeredAtDatetime"),
  }),
});

// Schema cho quiz submission statistics (dùng cho tính toán chi tiết quiz)
export const quizSubmissionStatsSchema = z.object({
  totalQuestions: z.number(),
  answeredQuestions: z.number(),
  correctAnswers: z.number(),
  incorrectAnswers: z.number(),
  accuracyRate: z.number(),
});

export type QuizSubmissionStats = z.infer<typeof quizSubmissionStatsSchema>;

// Base submission schema used by both essay and quiz
const baseSubmissionSchema = z.object({
  content: z.string().optional(),
  documentIds: z.array(z.number()).default([]),
  answers: z.array(createQuizAnswerSchema).default([]),
});

// Essay: require at least one of content or documentIds
export const createEssaySubmissionSchema = baseSubmissionSchema.refine(
  (data) => {
    const hasContent = !!(data.content && data.content.trim().length > 0);
    const hasFiles =
      Array.isArray(data.documentIds) && data.documentIds.length > 0;
    return hasContent || hasFiles;
  },
  {
    message: t("provideContentOrFile"),
    path: ["content"],
  }
);

// Quiz: require non-empty answers; files/content are allowed but optional
export const createQuizSubmissionSchema = baseSubmissionSchema.superRefine(
  (data, ctx) => {
    if (!data.answers || data.answers.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("quizMustIncludeAnswers"),
        path: ["answers"],
      });
    }
  }
);

// A helper to choose schema based on assignment type
export const buildCreateSubmissionSchema = (assignmentType: AssignmentType) => {
  return assignmentType === AssignmentType.Quiz
    ? createQuizSubmissionSchema
    : createEssaySubmissionSchema;
};

// Grading schema; use factory to enforce assignment-specific max score when available
export const buildGradeSubmissionSchema = (maxScore?: number) => {
  const scoreSchema =
    maxScore != null
      ? z.number().min(0, t("scoreMin")).max(maxScore, t("scoreMax"))
      : z.number().min(0, t("scoreMin"));

  return z.object({
    score: scoreSchema,
    // Matches backend property name feedback
    feedback: z.string().max(2000, t("feedbackMaxLength")).optional(),
  });
};

// Re-export file upload validation for convenience in submission flows
export const submissionFileUploadSchema = fileUploadSchema;

// Types for forms
export type CreateQuizAnswerFormData = z.infer<typeof createQuizAnswerSchema>;
export type CreateEssaySubmissionFormData = z.infer<
  typeof createEssaySubmissionSchema
>;
export type CreateQuizSubmissionFormData = z.infer<
  typeof createQuizSubmissionSchema
>;
export type CreateSubmissionFormData = z.infer<typeof baseSubmissionSchema>;
export type GradeSubmissionFormData = z.infer<
  ReturnType<typeof buildGradeSubmissionSchema>
>;
