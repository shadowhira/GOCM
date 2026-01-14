import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileUpload,
  type UploadedFileItem,
} from "@/components/features/uploadFile/FileUpload";
import { Loader2 } from "lucide-react";

interface SubmissionFormProps {
  submissionText: string;
  onSubmissionTextChange: (value: string) => void;
  uploadedFilesCount: number;
  onFilesChange: (files: UploadedFileItem[]) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  uploadEndpoint: string;
  classId: number;
  canSubmit: boolean;
  buildFormData: (file: File) => FormData;
  isEditMode?: boolean;
  onCancelEdit?: () => void;
  uploadedFiles?: UploadedFileItem[];
}

export function SubmissionForm({
  submissionText,
  onSubmissionTextChange,
  uploadedFilesCount,
  onFilesChange,
  isSubmitting,
  onSubmit,
  uploadEndpoint,
  canSubmit,
  buildFormData,
  isEditMode = false,
  onCancelEdit,
  uploadedFiles = [],
}: SubmissionFormProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="submission-text">{t("submission_text")}</Label>
        <Textarea
          id="submission-text"
          placeholder={t("enter_submission_text")}
          value={submissionText}
          onChange={(e) => onSubmissionTextChange(e.target.value)}
          rows={6}
          disabled={isSubmitting}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <div className="border rounded-lg p-4 bg-muted/30">
          <Label className="text-sm font-medium mb-3 block">
            {t("upload_files")}
          </Label>
          <FileUpload
            action={uploadEndpoint}
            method="post"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip,.rar"
            maxSizeMB={10}
            buttonLabel={t("upload_file")}
            disabled={!canSubmit}
            multiple={true}
            buildFormData={buildFormData}
            onFilesChange={onFilesChange}
            initialFiles={uploadedFiles}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {isEditMode && onCancelEdit && (
          <Button
            onClick={onCancelEdit}
            disabled={isSubmitting}
            size="lg"
            variant="outline"
            className="w-40"
          >
            {t("cancel")}
          </Button>
        )}
        <Button
          onClick={onSubmit}
          disabled={
            isSubmitting || (!submissionText.trim() && uploadedFilesCount === 0)
          }
          size="lg"
          className="w-40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? t("updating") : t("submitting")}
            </>
          ) : (
            isEditMode ? t("update") : t("submit")
          )}
        </Button>
      </div>
    </div>
  );
}
