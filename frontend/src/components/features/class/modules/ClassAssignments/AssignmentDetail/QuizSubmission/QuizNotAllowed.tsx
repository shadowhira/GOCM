import { AlertCircle } from "lucide-react";

interface QuizNotAllowedProps {
  isOverdue: boolean;
  t: (key: string) => string;
}

export function QuizNotAllowed({ isOverdue, t }: QuizNotAllowedProps) {
  return (
    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="w-4 h-4" />
        <span className="font-medium">{t("submission_not_allowed")}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {isOverdue ? t("quiz_overdue") : t("quiz_already_submitted")}
      </p>
    </div>
  );
}
