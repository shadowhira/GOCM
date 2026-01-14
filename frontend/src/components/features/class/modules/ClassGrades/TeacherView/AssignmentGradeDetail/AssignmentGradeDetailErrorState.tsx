import React from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface AssignmentGradeDetailErrorStateProps {
  error?: Error | null;
}

export const AssignmentGradeDetailErrorState = ({
  error,
}: AssignmentGradeDetailErrorStateProps) => {
  const t = useTranslations();

  return (
    <Card className="p-8 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {t("failed_to_load_data")}
      </h3>
      <p className="text-muted-foreground">
        {error instanceof Error ? error.message : t("error_occurred")}
      </p>
    </Card>
  );
};