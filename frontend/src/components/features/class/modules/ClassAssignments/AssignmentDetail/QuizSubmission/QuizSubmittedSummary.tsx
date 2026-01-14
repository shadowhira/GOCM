import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseBackendDateTime } from "@/lib/utils";
import type { AssignmentResponse } from "@/types/assignment";

interface QuizSubmittedSummaryProps {
  submittedTime?: Date;
  hasAnswers: boolean;
  showAnswers: boolean;
  onToggleAnswers: () => void;
  assignment: AssignmentResponse;
  classId: number;
  submissionId?: number;
  t: (key: string) => string;
}

export function QuizSubmittedSummary({
  submittedTime,
  hasAnswers,
  showAnswers,
  onToggleAnswers,
  assignment,
  classId,
  submissionId,
  t,
}: QuizSubmittedSummaryProps) {
  const pathname = usePathname();
  // Extract locale from pathname (e.g., /en/class/1/... -> en)
  const locale = pathname.split("/")[1];

  // Check if assignment allows showing results and deadline has passed
  const now = new Date();
  const deadline = parseBackendDateTime(String(assignment.deadline)) || new Date(assignment.deadline);
  const canViewDetails =
    assignment.allowShowResultToStudent &&
    now > deadline &&
    submissionId;

  return (
    <div className="p-4 rounded-lg border bg-muted/20">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-success mt-0.5" />
        <div className="space-y-1 flex-1">
          <p className="font-medium text-foreground">{t("quiz_submitted")}</p>
          {submittedTime && (
            <p className="text-sm text-muted-foreground">
              {t("submission_time")}:{" "}
              {format(
                parseBackendDateTime(String(submittedTime)) || new Date(submittedTime),
                "dd/MM/yyyy - HH:mm",
                {
                  locale: vi,
                }
              )}
            </p>
          )}
          {canViewDetails ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <Link
                href={`/${locale}/class/${classId}/assignments/${assignment.id}/submissions/${submissionId}`}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("view_submission_details")}
              </Link>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("results_after_grading")}
            </p>
          )}
          {hasAnswers && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 px-2 h-7"
              onClick={onToggleAnswers}
            >
              <Eye className="w-4 h-4 mr-1" />
              {showAnswers
                ? t("hide_selected_answers")
                : t("view_selected_answers")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
