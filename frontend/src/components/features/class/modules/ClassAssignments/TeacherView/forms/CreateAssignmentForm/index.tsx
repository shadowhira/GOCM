"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  createAssignmentSchema,
  updateAssignmentSchema,
  type CreateAssignmentFormData,
  type UpdateAssignmentFormData,
} from "@/schemas/assignmentSchema";
import { AssignmentType } from "@/types/constants";
import type { Assignment } from "@/types/assignment";
import {
  useCreateAssignment,
  useUpdateAssignment,
} from "@/queries/assignmentQueries";

import {
  AssignmentBasicInfo,
  AttachmentManager,
  FormActions,
} from "../shared/export";

interface CreateAssignmentFormProps {
  mode: "create" | "edit";
  classId: number;
  initialData?: UpdateAssignmentFormData;
  editingAssignment?: Assignment | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateAssignmentForm({
  mode,
  classId,
  initialData,
  editingAssignment,
  onSuccess,
  onCancel,
}: CreateAssignmentFormProps) {
  const t = useTranslations();
  const [attachmentIds, setAttachmentIds] = React.useState<number[]>([]);

  const schema =
    mode === "create" ? createAssignmentSchema : updateAssignmentSchema;

  type FormData = CreateAssignmentFormData | UpdateAssignmentFormData;
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: initialData || {
      title: "",
      content: "",
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxScore: 10,
      type: AssignmentType.Essay,
      attachedDocumentIds: [],
      listQuestions: [],
      allowShowResultToStudent: false,
    },
  });

  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateAssignment();

  // Reset form when initialData changes (edit mode)
  React.useEffect(() => {
    if (initialData && mode === "edit") {
      form.reset(initialData);
      if (
        initialData.attachedDocumentIds &&
        initialData.attachedDocumentIds.length > 0
      ) {
        setAttachmentIds(initialData.attachedDocumentIds);
      }
    }
  }, [initialData, mode, form]);

  const onSubmit = async (
    data: CreateAssignmentFormData | UpdateAssignmentFormData
  ) => {
    try {
      const transformedData = {
        ...data,
        deadline: data.deadline,
        type: AssignmentType.Essay,
        attachedDocumentIds: attachmentIds,
        listQuestions: [],
      };

      if (mode === "create") {
        await createAssignmentMutation.mutateAsync({
          classId,
          data: transformedData,
        });
      } else if ("id" in data && data.id) {
        await updateAssignmentMutation.mutateAsync({
          classId,
          assignmentId: data.id,
          data: transformedData,
        });
      }

      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
      throw error;
    }
  };

  const isLoading =
    createAssignmentMutation.isPending || updateAssignmentMutation.isPending;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
          toast.error(t(String(firstError.message)));
        } else {
          toast.error(t("please_check_all_required_fields"));
        }
      })}
      className="space-y-6"
    >
      <AssignmentBasicInfo
        form={form}
        typeLabel={t("essay")}
        assignmentType={AssignmentType.Essay}
      />

      <AttachmentManager
        classId={classId}
        onDocumentIdsChange={setAttachmentIds}
        initialDocuments={editingAssignment?.attachments || []}
      />

      <FormActions mode={mode} isLoading={isLoading} onCancel={onCancel} />
    </form>
  );
}
