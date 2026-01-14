"use client";

import Image from "next/image";

interface FilePreviewProps {
  previewUrl: string;
  alt?: string;
}

export function FilePreview({ previewUrl, alt = "Preview" }: FilePreviewProps) {
  return (
    <div className="relative h-32 w-32 overflow-hidden rounded-full border bg-muted">
      <Image src={previewUrl} alt={alt} fill className="object-cover" />
    </div>
  );
}
