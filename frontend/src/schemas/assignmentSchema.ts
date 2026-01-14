import { z } from "zod";
import {
  AssignmentType,
  QuestionType,
  AssignmentStatus,
  FileType,
} from "@/types/constants";
import { t } from "@/lib/i18n-zod";

// Base schemas
export const attachmentSchema = z.object({
  id: z.number().optional(),
  fileName: z.string().min(1, t("fileNameRequired")),
  fileType: z.nativeEnum(FileType),
  publicUrl: z.string().url(t("invalidUrl")).optional(),
  file: z.instanceof(File).optional(),
});

export const quizOptionSchema = z.object({
  id: z.number().optional(),
  optionText: z.string().min(1, t("optionTextRequired")),
  isCorrect: z.boolean(),
});

export const quizQuestionSchema = z.object({
  id: z.number().optional(),
  questionText: z.string().min(1, t("questionRequired")),
  questionType: z.nativeEnum(QuestionType),
  point: z.number().min(0.01, t("pointMin")),
  options: z.array(quizOptionSchema).min(2, t("minTwoOptions")),
});

// Validation for quiz questions (strict for create)
const quizQuestionValidation = quizQuestionSchema.refine(
  (data) => {
    if (data.questionType === QuestionType.SingleChoice) {
      const correctCount = data.options.filter((opt) => opt.isCorrect).length;
      return correctCount === 1;
    }
    if (data.questionType === QuestionType.MultipleChoice) {
      const correctCount = data.options.filter((opt) => opt.isCorrect).length;
      return correctCount >= 1;
    }
    return true;
  },
  {
    message: t("singleChoiceOneCorrect"),
    path: ["options"],
  }
);

// Relaxed validation for quiz questions (for update)
const quizQuestionUpdateValidation = quizQuestionSchema;

// Assignment form schemas
export const createAssignmentSchema = z
  .object({
    title: z.string().min(1, t("titleRequired")).max(200, t("titleMaxLength")),
    content: z.string().optional(),
    deadline: z
      .date({
        message: t("deadlineRequired"),
      })
      .refine((date) => date > new Date(), {
        message: t("deadlineFuture"),
      }),
    maxScore: z.number().min(0, t("maxScoreMin")).max(1000, t("maxScoreMax")),
    type: z.nativeEnum(AssignmentType),
    attachedDocumentIds: z.array(z.number()).optional(),
    listQuestions: z.array(quizQuestionValidation).optional(),
    allowShowResultToStudent: z.boolean(),
  })
  .refine(
    (data) => {
      // If type is Quiz, must have quizType and questions
      if (data.type === AssignmentType.Quiz) {
        return data.listQuestions && data.listQuestions.length > 0;
      }
      return true;
    },
    {
      message: t("quizMustHaveQuestions"),
      path: ["listQuestions"],
    }
  );

export const updateAssignmentSchema = z
  .object({
    id: z.number().optional(),
    title: z.string().min(1, t("titleRequired")).max(200, t("titleMaxLength")),
    content: z.string().optional(),
    deadline: z
      .date({
        message: t("deadlineRequired"),
      })
      .refine((date) => date > new Date(), {
        message: t("deadlineFuture"),
      }),
    maxScore: z.number().min(0, t("maxScoreMin")).max(1000, t("maxScoreMax")),
    type: z.nativeEnum(AssignmentType),
    attachedDocumentIds: z.array(z.number()).optional(),
    listQuestions: z.array(quizQuestionUpdateValidation).optional(),
    allowShowResultToStudent: z.boolean(),
  })
  .refine(
    (data) => {
      // If type is Quiz, must have quizType and questions
      if (data.type === AssignmentType.Quiz) {
        return data.listQuestions && data.listQuestions.length > 0;
      }
      return true;
    },
    {
      message: t("quizMustHaveQuestions"),
      path: ["listQuestions"],
    }
  );

export const assignmentFiltersSchema = z.object({
  status: z.array(z.nativeEnum(AssignmentStatus)).optional(),
  type: z.array(z.nativeEnum(AssignmentType)).optional(),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
  classId: z.number().optional(),
});

export const paginatedAssignmentsRequestSchema = z.object({
  pageNumber: z.number().min(1, t("pageNumberMin")),
  pageSize: z.number().min(1, t("pageSizeMin")).max(100, t("pageSizeMax")),
  title: z.string().optional(),
});

// Search and filter schemas
export const assignmentSearchSchema = z.object({
  query: z.string().min(1, t("searchQueryRequired")),
  filters: assignmentFiltersSchema.optional(),
  sortBy: z.enum(["title", "deadline", "createdAt", "maxScore"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, t("fileSizeMax"))
    .refine((file) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/jpg",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "application/zip",
        "application/x-rar-compressed",
        "application/x-7z-compressed",
      ];
      return allowedTypes.includes(file.type);
    }, t("fileTypeNotSupported")),
});

// Import assignment from Excel schema
export const importAssignmentFromExcelSchema = z.object({
  title: z.string().min(1, t("titleRequired")).max(200, t("titleMaxLength")),
  content: z.string().optional(),
  deadline: z
    .date({
      message: t("deadlineRequired"),
    })
    .refine((date) => date > new Date(), {
      message: t("deadlineFuture"),
    }),
  excelFile: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, t("fileSizeMax"))
    .refine((file) => {
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      return (
        allowedTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      );
    }, t("excelFileRequired")),
});

// AI Quiz Generation schemas
export const difficultyDistributionSchema = z.object({
  easy: z.number().min(0, t("minZero")).max(30, t("maxThirty")),
  medium: z.number().min(0, t("minZero")).max(30, t("maxThirty")),
  hard: z.number().min(0, t("minZero")).max(30, t("maxThirty")),
}).refine((data) => data.easy + data.medium + data.hard > 0, {
  message: t("atLeastOneQuestion"),
}).refine((data) => data.easy + data.medium + data.hard <= 30, {
  message: t("maxThirtyTotal"),
});

export const questionTypeDistributionSchema = z.object({
  single: z.number().min(0, t("minZero")),
  multiple: z.number().min(0, t("minZero")),
});

// Base schema without refinement for extending
const aiQuizParametersBaseSchema = z.object({
  difficulty_distribution: difficultyDistributionSchema,
  question_type_distribution: questionTypeDistributionSchema,
  language: z.string().min(1, t("languageRequired")),
  total_points: z.number().min(1, t("minOnePoint")),
  point_strategy: z.enum(["equal", "difficulty_weighted"]),
});

// Refinement function for question distribution validation
const questionDistributionRefinement = (data: {
  difficulty_distribution: { easy: number; medium: number; hard: number };
  question_type_distribution: { single: number; multiple: number };
}) => {
  const totalQuestions = data.difficulty_distribution.easy + data.difficulty_distribution.medium + data.difficulty_distribution.hard;
  const totalTypeQuestions = data.question_type_distribution.single + data.question_type_distribution.multiple;
  return totalQuestions === totalTypeQuestions;
};

export const aiQuizParametersSchema = aiQuizParametersBaseSchema.refine(questionDistributionRefinement, {
  message: t("questionTypeDistributionMustMatch"),
  path: ["question_type_distribution"],
});

export const aiQuizFromPromptSchema = aiQuizParametersBaseSchema.extend({
  prompt: z.string().min(1, t("promptRequired")),
}).refine(questionDistributionRefinement, {
  message: t("questionTypeDistributionMustMatch"),
  path: ["question_type_distribution"],
});

export const aiQuizFromFileSchema = aiQuizParametersBaseSchema.extend({
  file: z.instanceof(File),
  prompt: z.string().optional(),
}).refine(questionDistributionRefinement, {
  message: t("questionTypeDistributionMustMatch"),
  path: ["question_type_distribution"],
});

// Type exports for form data
export type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentFormData = z.infer<typeof updateAssignmentSchema>;
export type ImportAssignmentFromExcelFormData = z.infer<
  typeof importAssignmentFromExcelSchema
>;
export type AssignmentFiltersFormData = z.infer<typeof assignmentFiltersSchema>;
export type PaginatedAssignmentsRequestFormData = z.infer<
  typeof paginatedAssignmentsRequestSchema
>;
export type AssignmentSearchFormData = z.infer<typeof assignmentSearchSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type AttachmentFormData = z.infer<typeof attachmentSchema>;
export type QuizQuestionFormData = z.infer<typeof quizQuestionSchema>;
export type QuizOptionFormData = z.infer<typeof quizOptionSchema>;
export type AIQuizParametersFormData = z.infer<typeof aiQuizParametersSchema>;
export type AIQuizFromPromptFormData = z.infer<typeof aiQuizFromPromptSchema>;
export type AIQuizFromFileFormData = z.infer<typeof aiQuizFromFileSchema>;
