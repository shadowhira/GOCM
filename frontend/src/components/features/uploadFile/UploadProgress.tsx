"use client";

import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";

interface UploadProgressProps {
  progress: number;
}

export function UploadProgress({ progress }: UploadProgressProps) {
  const t = useTranslations();

  return (
    <div className="space-y-2">
      <Progress value={progress} />
      <p className="text-center text-sm text-muted-foreground">
        {t("uploading_with_progress", { progress })}
      </p>
    </div>
  );
}
