import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn, parseBackendDateTime } from "@/lib/utils";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";

interface SubmissionHeaderProps {
  hasSubmitted: boolean;
  isOverdue: boolean;
  deadline: Date;
}

export function SubmissionHeader({
  hasSubmitted,
  isOverdue,
  deadline,
}: SubmissionHeaderProps) {
  const t = useTranslations();

  const formatDeadline = (deadline: Date | string) => {
    try {
      const parsed = typeof deadline === 'string' 
        ? parseBackendDateTime(deadline) 
        : parseBackendDateTime(deadline.toISOString());
      if (!parsed) return String(deadline);
      return format(parsed, "dd/MM/yyyy - HH:mm", {
        locale: vi,
      });
    } catch {
      return String(deadline);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <FileText className="w-5 h-5 text-primary shrink-0" />
        <h2 className="text-lg font-semibold text-foreground">
          {t("submit_assignment")}
        </h2>
        <SubmissionStatusBadge
          hasSubmitted={hasSubmitted}
          isOverdue={isOverdue}
        />
      </div>
      <div className="text-sm text-muted-foreground">
        {t("deadline")}:{" "}
        <span className={cn(isOverdue && "text-destructive font-medium")}>
          {formatDeadline(deadline)}
        </span>
      </div>
    </div>
  );
}
