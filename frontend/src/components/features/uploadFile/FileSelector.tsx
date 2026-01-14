"use client";

import { useRef, type ChangeEvent } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { validateFileSize, isImageFile } from "@/lib/fileUtils";
import { FileUploadInput } from "./FileUploadInput";

interface FileSelectorProps {
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  isUploading?: boolean;
  onFileSelect: (file: File, previewUrl: string | null) => void;
  multiple?: boolean;
}

export function FileSelector({
  accept,
  maxSizeMB,
  disabled,
  isUploading,
  onFileSelect,
  multiple = false,
}: FileSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // In multiple mode, process all files
    // In single mode, process only the first file
    const filesToProcess = multiple ? Array.from(files) : [files[0]];

    for (const selected of filesToProcess) {
      // Validate file size
      if (maxSizeMB && !validateFileSize(selected, maxSizeMB)) {
        toast.error(t("file_size_limit_exceeded", { size: maxSizeMB }));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        continue; // Skip this file, process next
      }

      // Generate preview URL if it's an image
      let previewUrl: string | null = null;
      if (isImageFile(selected)) {
        previewUrl = URL.createObjectURL(selected);
      }

      onFileSelect(selected, previewUrl);
    }

    // Reset input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <FileUploadInput
      ref={fileInputRef}
      onChange={handleSelect}
      accept={accept}
      disabled={disabled}
      isUploading={isUploading}
      multiple={multiple}
    />
  );
}
