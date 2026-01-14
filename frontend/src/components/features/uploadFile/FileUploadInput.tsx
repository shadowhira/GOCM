"use client";

import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";

interface FileUploadButtonProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  disabled?: boolean;
  isUploading?: boolean;
  className?: string;
  multiple?: boolean;
}

export const FileUploadInput = forwardRef<
  HTMLInputElement,
  FileUploadButtonProps
>(({ onChange, accept, disabled, isUploading, className, multiple }, ref) => {
  const t = useTranslations();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Create a synthetic event for onChange handler
      const syntheticEvent = {
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 w-full min-h-[120px] px-6 py-8 rounded-lg border-2 border-dashed transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border bg-background hover:border-primary/50 hover:bg-accent/50",
        (disabled || isUploading) &&
          "opacity-50 cursor-not-allowed pointer-events-none",
        !disabled && !isUploading && "cursor-pointer",
        className
      )}
    >
      <Upload
        className={cn(
          "h-8 w-8 transition-colors",
          isDragging ? "text-primary" : "text-muted-foreground"
        )}
      />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {isUploading
            ? t("uploading")
            : isDragging
            ? t("drop_file_here")
            : t("click_or_drag_to_upload")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {accept ? `${t("supported_formats")}: ${accept}` : t("any_file")}
        </p>
      </div>
      <input
        ref={ref}
        type="file"
        className="sr-only"
        onChange={onChange}
        accept={accept}
        disabled={disabled || isUploading}
        multiple={multiple}
      />
    </label>
  );
});

FileUploadInput.displayName = "FileUploadInput";
