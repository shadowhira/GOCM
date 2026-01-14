import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";

interface SubmissionNotAllowedProps {
  isOverdue: boolean;
  hasSubmitted: boolean;
}

export function SubmissionNotAllowed({ isOverdue }: SubmissionNotAllowedProps) {
  const t = useTranslations();

  return (
    <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-warning-900 dark:text-warning-100">
            {isOverdue ? t("submission_overdue") : t("already_submitted")}
          </h4>
          <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
            {isOverdue
              ? t("submission_overdue_message")
              : t("already_submitted_message")}
          </p>
        </div>
      </div>
    </div>
  );
}
