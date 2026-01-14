import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

interface SubmissionSuccessProps {
  submittedAt: Date;
  onViewDetails: () => void;
  showDetails?: boolean;
}

export function SubmissionSuccess({
  submittedAt,
  onViewDetails,
  showDetails = false,
}: SubmissionSuccessProps) {
  const t = useTranslations();

  return (
    <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-success-900 dark:text-success-100">
              {t("submitted_successfully")}
            </h4>
            <p className="text-sm text-success-700 dark:text-success-300 mt-1">
              {t("submitted_at")}:{" "}
              {format(new Date(submittedAt), "dd/MM/yyyy HH:mm")}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 px-2 h-7"
              onClick={onViewDetails}
            >
              {showDetails ? (
                <EyeOff className="w-4 h-4 mr-1" />
              ) : (
                <Eye className="w-4 h-4 mr-1" />
              )}
              {showDetails ? t("hide_submission") : t("view_submission")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
