"use client"

import * as React from "react"
import { X, FileIcon, Loader2, Paperclip } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface FileItem {
  id: number | string // ID từ backend hoặc temp ID
  file?: File // File object (khi mới chọn)
  fileName: string
  fileSize?: number
  url?: string // URL từ backend (khi đã upload)
  isUploading?: boolean
}

interface FileUploadInputProps {
  files: FileItem[]
  onFilesChange: (files: FileItem[]) => void
  onRemove: (fileId: number | string) => void
  accept?: string // e.g., "image/*,.pdf,.doc,.docx"
  maxFiles?: number
  maxSizeInMB?: number
  disabled?: boolean
  className?: string
  label?: string
  helperText?: string
}

export const FileUploadInput = ({
  files,
  onFilesChange,
  onRemove,
  accept = "*",
  maxFiles = 5,
  maxSizeInMB = 10,
  disabled = false,
  className,
  label,
  helperText,
}: FileUploadInputProps) => {
  const t = useTranslations()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(t("max_files_exceeded", { maxFiles }))
      return
    }

    const validFiles: FileItem[] = []
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024

    selectedFiles.forEach((file) => {
      if (file.size > maxSizeInBytes) {
        toast.error(t("file_size_exceeded", { fileName: file.name, maxSize: maxSizeInMB }))
        return
      }

      validFiles.push({
        id: `temp-${Date.now()}-${Math.random()}`, // Temp ID
        file,
        fileName: file.name,
        fileSize: file.size,
        isUploading: false,
      })
    })

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles])
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || files.length >= maxFiles}
          className="gap-2"
        >
          <Paperclip className="w-4 h-4" />
          {t("attach_file")}
        </Button>
        {helperText && (
          <span className="text-xs text-muted-foreground">{helperText}</span>
        )}
      </div>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border bg-card",
                "hover:bg-accent/50 transition-colors",
                fileItem.isUploading && "opacity-70"
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {fileItem.isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <FileIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fileItem.fileName}
                </p>
                {fileItem.fileSize && (
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileItem.fileSize)}
                  </p>
                )}
                {fileItem.isUploading && (
                  <p className="text-xs text-primary">{t("uploading")}</p>
                )}
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemove(fileItem.id)}
                disabled={disabled || fileItem.isUploading}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
