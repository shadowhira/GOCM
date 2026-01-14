"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileUpload } from "@/components/features/uploadFile/FileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paperclip } from "lucide-react";
import type { UploadedFileItem } from "@/components/features/uploadFile/FileUpload";
import type { AttachmentResponse } from "@/types/assignment";

interface AttachmentManagerProps {
  classId: number;
  onDocumentIdsChange?: (documentIds: number[]) => void;
  initialDocuments?: AttachmentResponse[];
}

export function AttachmentManager({
  classId,
  onDocumentIdsChange,
  initialDocuments = [],
}: AttachmentManagerProps) {
  const t = useTranslations();

  // Convert AttachmentResponse to UploadedFileItem format
  const initialFiles: UploadedFileItem[] = React.useMemo(
    () =>
      initialDocuments.map((doc) => ({
        id: doc.id.toString(),
        publicUrl: doc.publicUrl || "",
        documentId: doc.id,
        fileName: doc.fileName,
      })),
    [initialDocuments]
  );

  const buildFormData = (file: File): FormData => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("classId", classId.toString());
    formData.append("parentType", "1"); // ASSIGNMENT = 1
    return formData;
  };

  const handleFilesChange = (files: UploadedFileItem[]) => {
    const documentIds = files
      .map((f) => f.documentId)
      .filter((id): id is number => id !== undefined);
    onDocumentIdsChange?.(documentIds);
  };

  return (
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
  );
}
