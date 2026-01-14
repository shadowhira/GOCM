"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseBackendDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { AssignmentDetailResponse } from "@/types/assignment";
import { SubmissionResponse } from "@/types/submission";
import { FileType } from "@/types/constants";

interface GroupSubmissionDetailContentProps {
  submission: SubmissionResponse;
  assignment: AssignmentDetailResponse;
}

export const GroupSubmissionDetailContent = ({
  submission,
}: GroupSubmissionDetailContentProps): React.ReactElement => {
  const t = useTranslations();

  const getFileTypeColor = (fileType: number) => {
    switch (fileType) {
      case 0: // PDF
        return "bg-destructive/20 text-destructive border-destructive/40";
      case 1: // Word
        return "bg-primary/20 text-primary border-primary/40";
      case 2: // Excel
        return "bg-success/20 text-success border-success/40";
      case 3: // PowerPoint
        return "bg-warning/20 text-warning border-warning/40";
      case 4: // Image
        return "bg-accent/20 text-accent-foreground border-accent/40";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/40";
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      {/* Nội dung bài làm và Files đính kèm */}
      {(submission.content || (submission.submittedFiles && submission.submittedFiles.length > 0)) ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Nội dung bài làm */}
          {submission.content && (
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold">{t("submission_content")}</h3>
              </div>
              <div className="bg-muted/20 rounded-lg p-3 sm:p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {submission.content}
                </p>
              </div>
            </div>
          )}

          {/* Files đính kèm */}
          {submission.submittedFiles && submission.submittedFiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold">
                  {t("submitted_files")} ({submission.submittedFiles.length})
                </h3>
              </div>
              <div className="space-y-2">
                {submission.submittedFiles.map((file) => (
                  <a
                    key={file.id}
                    href={file.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                  <Badge
                      variant="outline"
                      className={`${getFileTypeColor(
                      file.fileType
                      )} shrink-0`}
                  >
                      {FileType[file.fileType]}
                  </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseBackendDateTime(String(file.updatedAt)) || new Date(file.updatedAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">{t("no_content_submitted")}</p>
        </div>
      )}
    </Card>
  );
};
