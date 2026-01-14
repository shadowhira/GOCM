import { FileType } from "@/types/constants";

/**
 * Helper functions cho file upload
 */

/**
 * Xác định FileType dựa vào MIME type
 */
export function getFileTypeFromMimeType(mimeType: string): FileType {
  if (mimeType === "application/pdf") return FileType.PDF;

  if (
    mimeType.includes("word") ||
    mimeType.includes("msword") ||
    mimeType.includes("wordprocessingml")
  ) {
    return FileType.WORD;
  }

  if (
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("ms-excel")
  ) {
    return FileType.EXCEL;
  }

  if (
    mimeType.includes("powerpoint") ||
    mimeType.includes("presentation") ||
    mimeType.includes("ms-powerpoint")
  ) {
    return FileType.POWERPOINT;
  }

  if (mimeType.startsWith("image/")) return FileType.IMAGE;

  if (mimeType.startsWith("video/")) return FileType.VIDEO;

  if (mimeType.startsWith("audio/")) return FileType.AUDIO;

  if (mimeType.startsWith("text/") || mimeType === "text/csv")
    return FileType.TEXT;

  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z") ||
    mimeType.includes("compressed")
  ) {
    return FileType.ZIP;
  }

  return FileType.OTHER;
}

/**
 * Format file size to readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate file type by extension
 */
export function validateFileType(
  file: File,
  allowedExtensions?: string[]
): boolean {
  if (!allowedExtensions || allowedExtensions.length === 0) return true;

  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Get file extension
 */
export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

/**
 * Check if file is image
 * Supports both File object (with type) and object with name property
 */
export function isImageFile(file?: File | { name: string }): boolean {
  if (!file) return false;
  
  // Check by MIME type if available (for real File objects)
  if ('type' in file && file.type) {
    return file.type.startsWith("image/");
  }
  
  // Fallback: check by file extension
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const extension = getFileExtension(file.name);
  return imageExtensions.includes(extension);
}

/**
 * Check if file is video
 */
export function isVideoFile(file?: File): boolean {
  return file?.type.startsWith("video/") ?? false;
}
