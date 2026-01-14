import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileType } from "@/types/constants";
import { format } from "date-fns";

interface SubmissionFile {
  id: string;
  name: string;
  url: string;
  size?: number;
  fileType: FileType;
  updatedAt: Date;
}

interface SubmissionHistoryProps {
  submittedAt: Date;
  submittedContent: string;
  submittedFiles: SubmissionFile[];
}

export function SubmissionHistory({
  submittedContent,
  submittedFiles,
}: SubmissionHistoryProps) {
  const t = useTranslations();

  const handleDownload = (file: SubmissionFile) => {
    window.open(file.url, "_blank");
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("submission_history")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submittedContent && (
          <div>
            <h5 className="text-sm font-medium mb-2">
              {t("submitted_content")}:
            </h5>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm whitespace-pre-wrap">{submittedContent}</p>
            </div>
          </div>
        )}

        {submittedFiles.length > 0 && (
          <div>
            <h5 className="text-sm font-medium mb-2">
              {t("submitted_files")}:
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {submittedFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleDownload(file)}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleDownload(file);
                    }
                  }}
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
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("updated_at")}:{" "}
                      {format(new Date(file.updatedAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
