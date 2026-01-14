"use client";

import { X, FileIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, isImageFile } from "@/lib/fileUtils";

interface FileItemProps {
  file: File;
  onRemove: () => void;
}

export function FileItem({ file, onRemove }: FileItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      {isImageFile(file) ? (
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      ) : (
        <FileIcon className="h-8 w-8 text-muted-foreground" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
