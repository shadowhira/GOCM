"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  createAssignmentSchema,
  type CreateAssignmentFormData,
} from "@/schemas/assignmentSchema";
import { AssignmentType } from "@/types/constants";
import type { CreateAssignmentRequest } from "@/types/assignment";
import { useCreateAssignment } from "@/queries/assignmentQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, FileSpreadsheet, Sparkles, FileText } from "lucide-react";

import { QuizBasicInfo, FormActions } from "../shared/export";
import { ManualQuizCreation } from "./ManualQuizCreation";
import { ExcelImportQuiz } from "./ExcelImportQuiz";
import { AIPromptQuiz } from "./AIPromptQuiz";
import { AIDocumentQuiz } from "./AIDocumentQuiz";

type QuizCreationMode = "manual" | "excel" | "ai-prompt" | "ai-document";

interface CreateQuizFormProps {
  classId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateQuizForm({
  classId,
  onSuccess,
  onCancel,
}: CreateQuizFormProps) {
  const t = useTranslations();
  const [creationMode, setCreationMode] =
    React.useState<QuizCreationMode>("manual");

  const form = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: "",
      content: "",
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxScore: 0,
      type: AssignmentType.Quiz,
      attachedDocumentIds: [],
      listQuestions: [],
      allowShowResultToStudent: false,
    },
  });

  const createAssignmentMutation = useCreateAssignment();

  const onSubmit = async (data: CreateAssignmentFormData) => {
    try {
      // Validate that quiz has questions
      if (!data.listQuestions || data.listQuestions.length === 0) {
        toast.error(t("quiz_must_have_questions"));
        return;
      }

      // Calculate maxScore from total points of all questions
      const totalPoints =
        data.listQuestions?.reduce((sum, q) => sum + (q.point || 0), 0) || 0;

      const transformedData: CreateAssignmentRequest = {
        title: data.title,
        content: data.content,
        deadline: data.deadline,
        type: AssignmentType.Quiz,
        maxScore: totalPoints,
        attachedDocumentIds: data.attachedDocumentIds,
        listQuestions: data.listQuestions?.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          point: q.point,
          options: q.options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          })),
        })),
      };

      await createAssignmentMutation.mutateAsync({
        classId,
        data: transformedData,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting quiz assignment:", error);
      toast.error(t("failed_to_create_assignment"));
    }
  };

  const isLoading = createAssignmentMutation.isPending;
  const hasQuestions = (form.watch("listQuestions") || []).length > 0;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <QuizBasicInfo form={form} />

      {/* Question Creation Modes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("quiz_creation_mode")}</h3>

        <Tabs
          value={creationMode}
          onValueChange={(value) => setCreationMode(value as QuizCreationMode)}
        >
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="manual" className="flex-col gap-1 py-2 px-1 text-[10px] sm:flex-row sm:gap-2 sm:py-1.5 sm:px-3 sm:text-sm">
              <Edit className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{t("manual_mode")}</span>
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex-col gap-1 py-2 px-1 text-[10px] sm:flex-row sm:gap-2 sm:py-1.5 sm:px-3 sm:text-sm">
              <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{t("excel")}</span>
            </TabsTrigger>
            <TabsTrigger value="ai-prompt" className="flex-col gap-1 py-2 px-1 text-[10px] sm:flex-row sm:gap-2 sm:py-1.5 sm:px-3 sm:text-sm">
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{t("ai")}</span>
            </TabsTrigger>
            <TabsTrigger value="ai-document" className="flex-col gap-1 py-2 px-1 text-[10px] sm:flex-row sm:gap-2 sm:py-1.5 sm:px-3 sm:text-sm">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{t("document")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-6">
            <ManualQuizCreation form={form} />
          </TabsContent>

          <TabsContent value="excel" className="mt-6">
            <ExcelImportQuiz form={form} />
          </TabsContent>

          <TabsContent value="ai-prompt" className="mt-6">
            <AIPromptQuiz form={form} />
          </TabsContent>

          <TabsContent value="ai-document" className="mt-6">
            <AIDocumentQuiz form={form} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Actions */}
      <FormActions
        mode="create"
        isLoading={isLoading}
        onCancel={onCancel}
        hasQuestions={hasQuestions}
      />
    </form>
  );
}
