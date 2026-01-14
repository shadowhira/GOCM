import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { SubmissionStatus } from "@/types/submission";

interface QuizStatusBadgeProps {
  submissionStatus: SubmissionStatus | null;
  hasSubmitted: boolean;
  isOverdue: boolean;
  t: (key: string) => string;
}

export function QuizStatusBadge({
  submissionStatus,
  hasSubmitted,
  isOverdue,
  t,
}: QuizStatusBadgeProps) {
  if (submissionStatus === SubmissionStatus.Graded) {
    return (
      <Badge
        variant="secondary"
        className="bg-success/20 text-success border-success/40"
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        {t("graded")}
      </Badge>
    );
  }

  if (hasSubmitted) {
    return (
      <Badge
        variant="secondary"
        className="bg-success/20 text-success border-success/40"
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        {t("submitted")}
      </Badge>
    );
  }

  if (isOverdue) {
    return (
      <Badge
        variant="destructive"
        className="bg-destructive/20 text-destructive border-destructive/40"
      >
        <AlertCircle className="w-3 h-3 mr-1" />
        {t("overdue")}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-warning/20 text-warning border-warning/40"
    >
      <Clock className="w-3 h-3 mr-1" />
      {t("pending")}
    </Badge>
  );
}
