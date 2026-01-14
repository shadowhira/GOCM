import { FileText } from "lucide-react";
import type { AttachmentResponse } from "@/types/assignment";
import { FileType } from "@/types/constants";

interface SubmittedFilesProps {
  files: AttachmentResponse[];
  t: (key: string) => string;
}

export function SubmittedFiles({ files, t }: SubmittedFilesProps) {
  return (
    <div className="bg-muted/20 rounded-lg p-4 border border-muted/40">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">
          {t("attached_files")} ({files.length})
        </h4>
      </div>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between py-3 px-3 bg-background rounded-md border border-muted/30 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => window.open(file.publicUrl, "_blank")}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-1.5 sm:p-2 rounded bg-primary/10 shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {FileType[file.fileType]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
