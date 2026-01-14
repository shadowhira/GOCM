"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  updateAssignmentSchema,
  type UpdateAssignmentFormData,
} from "@/schemas/assignmentSchema";
import { AssignmentType } from "@/types/constants";
import type { UpdateAssignmentRequest } from "@/types/assignment";
import { useUpdateAssignment } from "@/queries/assignmentQueries";

import { QuizBasicInfo, FormActions, QuizQuestions } from "../shared/export";

interface UpdateQuizFormProps {
  classId: number;
  initialData: UpdateAssignmentFormData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UpdateQuizForm({
  classId,
  initialData,
  onSuccess,
  onCancel,
}: UpdateQuizFormProps) {
  const t = useTranslations();

  const form = useForm<UpdateAssignmentFormData>({
    resolver: zodResolver(updateAssignmentSchema),
    defaultValues: initialData,
  });

  const updateAssignmentMutation = useUpdateAssignment();

  // Reset form when initialData changes
  React.useEffect(() => {
    form.reset(initialData);
  }, [initialData, form]);

  const onSubmit = async (data: UpdateAssignmentFormData) => {
    try {
      // Validate that quiz has questions
      if (!data.listQuestions || data.listQuestions.length === 0) {
        toast.error(t("quiz_must_have_questions"));
        return;
      }

      // Validate that assignment has an id
      if (!data.id) {
        toast.error(t("assignment_id_required"));
        return;
      }

      // Calculate maxScore from total points of all questions
      const totalPoints =
        data.listQuestions?.reduce((sum, q) => sum + (q.point || 0), 0) || 0;

      const transformedData: UpdateAssignmentRequest = {
        title: data.title,
        content: data.content,
        deadline: data.deadline,
        type: AssignmentType.Quiz,
        maxScore: totalPoints,
        attachedDocumentIds: data.attachedDocumentIds,
        listQuestions: data.listQuestions?.map((q) => ({
          id: q.id || 0,
          questionText: q.questionText,
          questionType: q.questionType,
          point: q.point,
          options: q.options.map((opt) => ({
            id: opt.id || 0,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          })),
        })),
      };

      await updateAssignmentMutation.mutateAsync({
        classId,
        assignmentId: data.id,
        data: transformedData,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error updating quiz assignment:", error);
      toast.error(t("update_failed"));
    }
  };

  const isLoading = updateAssignmentMutation.isPending;
  const hasQuestions = (form.watch("listQuestions") || []).length > 0;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <QuizBasicInfo form={form} />

      {/* Quiz Questions */}
      <QuizQuestions form={form} />

      {/* Form Actions */}
      <FormActions
        mode="edit"
        isLoading={isLoading}
        onCancel={onCancel}
        hasQuestions={hasQuestions}
      />
    </form>
  );
}
