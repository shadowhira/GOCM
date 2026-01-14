"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DateTimePicker from "@/components/ui/date-time-picker";
import { FileUpload } from "@/components/features/uploadFile/FileUpload";
import { FileText, Paperclip } from "lucide-react";
import { cn, parseBackendDateTime } from "@/lib/utils";
import type { UploadedFileItem } from "@/components/features/uploadFile/FileUpload";
import {
  createGroupAssignmentSchema,
  type CreateGroupAssignmentFormData,
} from "@/schemas/assignmentGroupSchema";

import type { AttachmentResponse } from "@/types/assignment";

interface CreateGroupAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateGroupAssignmentFormData) => void;
  isSubmitting?: boolean;
  classId: string;
  t: (key: string) => string;
  initialData?: CreateGroupAssignmentFormData & { id?: number };
  initialAttachments?: AttachmentResponse[];
}

export function CreateGroupAssignmentDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  classId,
  t,
  initialData,
  initialAttachments = [],
}: CreateGroupAssignmentDialogProps) {
  const [attachmentIds, setAttachmentIds] = React.useState<number[]>([]);

  const form = useForm<CreateGroupAssignmentFormData>({
    resolver: zodResolver(createGroupAssignmentSchema),
    defaultValues: {
      title: "",
      content: "",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxScore: 10,
      attachedDocumentIds: [],
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          title: initialData.title,
          content: initialData.content || "",
          deadline: initialData.deadline 
            ? (parseBackendDateTime(String(initialData.deadline)) || new Date(initialData.deadline)) 
            : new Date(),
          maxScore: initialData.maxScore,
          attachedDocumentIds: initialData.attachedDocumentIds || [],
        });
        setAttachmentIds(initialData.attachedDocumentIds || []);
      } else {
        form.reset({
          title: "",
          content: "",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          maxScore: 10,
          attachedDocumentIds: [],
        });
        setAttachmentIds([]);
      }
    }
  }, [open, initialData, form]);

  // Convert AttachmentResponse to UploadedFileItem format
    const initialFiles: UploadedFileItem[] = React.useMemo(
      () =>
        initialAttachments.map((doc) => ({
          id: doc.id.toString(),
          publicUrl: doc.publicUrl || "",
          documentId: doc.id,
          fileName: doc.fileName,
        })),
      [initialAttachments]
    );

  const handleSubmit = (data: CreateGroupAssignmentFormData) => {
    onSubmit({
      ...data,
      attachedDocumentIds: attachmentIds,
    });
  };

  const handleClose = () => {
    form.reset();
    setAttachmentIds([]);
    onOpenChange(false);
  };

  const buildFormData = (file: File): FormData => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("classId", classId);
    formData.append("parentType", "1"); // ASSIGNMENT = 1
    return formData;
  };

  const handleFilesChange = (files: UploadedFileItem[]) => {
    const documentIds = files
      .map((f) => f.documentId)
      .filter((id): id is number => id !== undefined);
    setAttachmentIds(documentIds);
    // Update form value to keep in sync
    form.setValue('attachedDocumentIds', documentIds);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-modal overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle>
            {initialData ? t("edit_group_assignment") : t("create_group_assignment")}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? t("edit_group_assignment_description")
              : t("create_group_assignment_description")}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {t("basic_information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t("title")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder={t("assignment_title_placeholder")}
                  className={cn(
                    form.formState.errors.title && "border-destructive"
                  )}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {t(String(form.formState.errors.title.message))}
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">{t("description")}</Label>
                <Textarea
                  id="content"
                  {...form.register("content")}
                  placeholder={t("assignment_description_placeholder")}
                  rows={4}
                  className={cn(
                    form.formState.errors.content && "border-destructive"
                  )}
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive">
                    {t(String(form.formState.errors.content.message))}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Deadline */}
                <Controller
                  name="deadline"
                  control={form.control}
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value ? field.value.toISOString() : ""}
                      onChange={(value: string) =>
                        field.onChange(new Date(value))
                      }
                      label={t("deadline")}
                      error={
                        form.formState.errors.deadline
                          ? t(String(form.formState.errors.deadline.message))
                          : undefined
                      }
                      placeholder={t("pick_date")}
                    />
                  )}
                />

                {/* Max Score */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    {t("max_score")} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="maxScore"
                    type="number"
                    {...form.register("maxScore", { valueAsNumber: true })}
                    min={0}
                    step={0.1}
                    placeholder="10"
                    className={cn(
                      form.formState.errors.maxScore && "border-destructive"
                    )}
                  />
                  {form.formState.errors.maxScore && (
                    <p className="text-sm text-destructive">
                      {t(String(form.formState.errors.maxScore.message))}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                {t("attachments")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                action="/Document"
                method="post"
                onFilesChange={handleFilesChange}
                buildFormData={buildFormData}
                multiple
                initialFiles={initialFiles}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? initialData
                  ? t("updating")
                  : t("creating")
                : initialData
                ? t("update")
                : t("create_assignment")}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}
