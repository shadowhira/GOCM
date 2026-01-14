"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FileSelector } from "./FileSelector";
import { FilePreview } from "./FilePreview";
import { FileItem } from "./FileItem";
import { FileUploadAction } from "./FileUploadAction";
import { UploadedFilesList } from "./UploadedFilesList";

type HttpMethod = "post" | "put" | "patch";

export interface UploadedFileItem {
  id: string;
  file?: File;
  publicUrl: string;
  documentId?: number; // Backend document ID for deletion
  uploading?: boolean;
  deleting?: boolean;
  fileName?: string; // For existing files from backend
}

interface FileUploadProps {
  action: string; // API endpoint để upload file
  method?: HttpMethod;
  accept?: string;
  maxSizeMB?: number; // Kích thước tối đa của file (MB)
  showPreview?: boolean; // Hiển thị preview nếu là image
  className?: string;
  disabled?: boolean;
  buttonLabel?: string; // Nút upload
  multiple?: boolean; // Allow multiple files
  // Callback when files list changes (parent can read this to get uploaded files)
  onFilesChange?: (files: UploadedFileItem[]) => void;
  onError?: (error: unknown) => void;
  buildFormData?: (file: File) => FormData;
  initialPreviewUrl?: string | null;
  onUploaded?: (response: unknown) => void;
  initialFiles?: UploadedFileItem[]; // Existing files from backend
}

export function FileUpload({
  action,
  method = "post",
  accept,
  maxSizeMB,
  showPreview = true,
  className,
  disabled,
  buttonLabel,
  multiple = false,
  onFilesChange,
  onError,
  buildFormData,
  initialPreviewUrl = null,
  onUploaded,
  initialFiles = [],
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = useState<
    Array<{ file: File; previewUrl: string | null }>
  >(initialPreviewUrl && file ? [{ file, previewUrl: initialPreviewUrl }] : []);
  const [uploadedFiles, setUploadedFiles] =
    useState<UploadedFileItem[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);

  // Update uploadedFiles when initialFiles changes (e.g., when entering edit mode)
  useEffect(() => {
    if (initialFiles.length > 0) {
      setUploadedFiles(initialFiles);
    }
  }, [initialFiles]);

  const handleFileSelect = (selectedFile: File, preview: string | null) => {
    if (multiple) {
      // Multiple mode: Add to pending files with preview
      setPendingFiles((prev) => [
        ...prev,
        { file: selectedFile, previewUrl: preview },
      ]);
      setFile(selectedFile); // Set last selected for display
    } else {
      // Single mode: Replace file
      setFile(selectedFile);
      setPendingFiles([{ file: selectedFile, previewUrl: preview }]);
    }
  };

  const handleUploadSuccess = (uploadedFile: UploadedFileItem) => {
    let updatedFiles: UploadedFileItem[];

    if (multiple) {
      // Multiple mode: Add to existing files
      updatedFiles = [...uploadedFiles, uploadedFile];
    } else {
      // Single mode: Replace existing file
      updatedFiles = [uploadedFile];
    }

    setUploadedFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleFilesChange = (files: UploadedFileItem[]) => {
    setUploadedFiles(files);
    onFilesChange?.(files);
  };

  const resetState = () => {
    setFile(null);
    setPendingFiles([]);
  };

  const removePendingFile = (fileToRemove: File) => {
    setPendingFiles((prev) =>
      prev.filter((item) => item.file !== fileToRemove)
    );
    if (file === fileToRemove) {
      const remaining = pendingFiles.filter(
        (item) => item.file !== fileToRemove
      );
      setFile(remaining[remaining.length - 1]?.file || null);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <FileSelector
        accept={accept}
        maxSizeMB={maxSizeMB}
        disabled={disabled || (!multiple && uploadedFiles.length > 0)}
        isUploading={isUploading}
        onFileSelect={handleFileSelect}
        multiple={multiple}
      />

      {/* Show image previews */}
      {showPreview && pendingFiles.some((item) => item.previewUrl) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-14 px-2">
          {pendingFiles
            .filter((item) => item.previewUrl)
            .map((item, index) => (
              <FilePreview
                key={`preview-${item.file.name}-${index}`}
                previewUrl={item.previewUrl!}
              />
            ))}
        </div>
      )}

      {/* Show pending files to upload */}
      {multiple && pendingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Files ready to upload ({pendingFiles.length})
          </p>
          <div className="space-y-1">
            {pendingFiles.map((item, index) => (
              <FileItem
                key={`${item.file.name}-${index}`}
                file={item.file}
                onRemove={() => removePendingFile(item.file)}
              />
            ))}
          </div>
        </div>
      )}

      {!multiple && file && <FileItem file={file} onRemove={resetState} />}

      <FileUploadAction
        file={file}
        files={multiple ? pendingFiles.map((item) => item.file) : undefined}
        action={action}
        method={method}
        buttonLabel={buttonLabel}
        buildFormData={buildFormData}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={onError}
        onReset={resetState}
        onUploadingChange={setIsUploading}
        onUploadResponse={onUploaded}
        disabled={
          (!multiple && uploadedFiles.length > 0) ||
          (multiple && pendingFiles.length === 0)
        }
        multiple={multiple}
      />

      {multiple ? (
        <UploadedFilesList
          files={uploadedFiles}
          onFilesChange={handleFilesChange}
        />
      ) : (
        uploadedFiles.length > 0 && (
          <UploadedFilesList
            files={uploadedFiles}
            onFilesChange={handleFilesChange}
          />
        )
      )}
    </div>
  );
}
