"use client"

import * as React from "react"
import { FileIcon, Download, ImageIcon, Video } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { AttachmentResponse } from "@/types/document"
import { FileType } from "@/types/constants"

const FALLBACK_IMAGE = "/images/placeholder-image.png"

interface AttachmentListProps {
  attachments: AttachmentResponse[]
  className?: string
  variant?: "default" | "compact" | "preview"
}

export const AttachmentList = ({
  attachments,
  className,
  variant = "default",
}: AttachmentListProps) => {
  const t = useTranslations()
  
  if (!attachments || attachments.length === 0) {
    return null
  }

  const handleDownload = async (attachment: AttachmentResponse) => {
    try {
      window.open(attachment.publicUrl, "_blank")
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case FileType.IMAGE:
        return <ImageIcon />
      case FileType.VIDEO:
        return <Video />
      default:
        return <FileIcon />
    }
  }

  const isImage = (fileType: FileType) => fileType === FileType.IMAGE

  // Variant preview: hiển thị ảnh dạng lưới, file khác dạng danh sách
  if (variant === "preview") {
    const images = attachments.filter(att => isImage(att.fileType));
    const otherFiles = attachments.filter(att => !isImage(att.fileType));

    return (
      <div className={cn("space-y-3", className)}>
        {/* Header */}
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileIcon className="w-4 h-4" />
          <span>{t("attachments_count", { count: attachments.length })}</span>
        </div>

        {/* Lưới preview ảnh */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((attachment) => (
              <div
                key={attachment.id}
                className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleDownload(attachment)}
              >
                <Image
                  src={attachment.publicUrl || FALLBACK_IMAGE}
                  alt={attachment.fileName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                {/* Overlay khi hover */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
                  <Download className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Tên file ở dưới */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-2">
                  <p className="text-background text-xs truncate">{attachment.fileName}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Danh sách file khác (không phải ảnh) */}
        {otherFiles.length > 0 && (
          <div className="space-y-2">
            {otherFiles.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors cursor-pointer"
                onClick={() => handleDownload(attachment)}
              >
                <div className="flex-shrink-0">
                  {getFileIcon(attachment.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-card-foreground truncate">{attachment.fileName}</p>
                </div>
                <Download className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Variant default & compact
  return (
    <div className={cn("space-y-2", className)}>
      {variant === "default" && (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileIcon className="w-4 h-4" />
          <span>{t("attachments_count", { count: attachments.length })}</span>
        </div>
      )}

      <div className={cn(
        "space-y-2",
        variant === "compact" && "space-y-1"
      )}>
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors",
              variant === "default" ? "p-3" : "p-2"
            )}
          >
            <div className="flex-shrink-0">
              {getFileIcon(attachment.fileType)}
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium text-card-foreground truncate",
                variant === "default" ? "text-sm" : "text-xs"
              )}>
                {attachment.fileName}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDownload(attachment)}
              className="flex-shrink-0"
              title={t("download")}
            >
              <Download className={cn(
                variant === "default" ? "w-4 h-4" : "w-3 h-3"
              )} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
