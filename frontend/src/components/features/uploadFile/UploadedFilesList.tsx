"use client";

import { useState } from "react";
import { X, FileIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatFileSize, isImageFile } from "@/lib/fileUtils";
import { useTranslations } from "next-intl";
import { useDeleteDocument } from "@/queries/documentQueries";
import type { UploadedFileItem } from "./FileUpload";

interface UploadedFilesListProps {
  files: UploadedFileItem[];
  onFilesChange: (files: UploadedFileItem[]) => void;
}

export function UploadedFilesList({
  files,
  onFilesChange,
}: UploadedFilesListProps) {
  const t = useTranslations();
  const deleteDocumentMutation = useDeleteDocument();
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const handleFileClick = (publicUrl: string) => {
    window.open(publicUrl, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (fileId: string) => {
    const targetFile = files.find((f) => f.id === fileId);
    if (!targetFile) return;

    // Mark as deleting
    setDeletingFiles((prev) => new Set(prev).add(fileId));

    try {
      // Call backend delete API if documentId exists
      if (targetFile.documentId) {
        await deleteDocumentMutation.mutateAsync(targetFile.documentId);
      }

      // Remove from list
      const updatedFiles = files.filter((f) => f.id !== fileId);
      onFilesChange(updatedFiles);
      toast.success(t("file_deleted"));
    } catch {
      toast.error(t("file_delete_failed"));
      // Unmark deleting on error
      setDeletingFiles((prev) => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{t("uploaded_files")}</h4>
      <div className="space-y-2">
        {files.map((uploadedFile) => {
          const isDeleting = deletingFiles.has(uploadedFile.id);
          const fileName =
            uploadedFile.file?.name || uploadedFile.fileName || "Unknown file";
          const fileSize = uploadedFile.file?.size;

          return (
            <div
              key={uploadedFile.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
            >
              {isImageFile(uploadedFile.file) ? (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              ) : (
                <FileIcon className="h-6 w-6 text-muted-foreground" />
              )}

              <button
                type="button"
                className="min-w-0 flex-1 text-left cursor-pointer"
                onClick={() => handleFileClick(uploadedFile.publicUrl)}
                title={t("click_to_open_file")}
              >
                <p className="truncate text-sm font-medium hover:text-primary transition-colors">
                  {fileName}
                </p>
                {fileSize && (
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileSize)}
                  </p>
                )}
              </button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(uploadedFile.id)}
                disabled={isDeleting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
