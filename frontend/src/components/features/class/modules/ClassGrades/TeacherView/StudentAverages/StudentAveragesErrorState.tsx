import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface StudentAveragesErrorStateProps {
  error?: Error | null;
}

export const StudentAveragesErrorState = ({
  error,
}: StudentAveragesErrorStateProps) => {
  const t = useTranslations();

  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="text-center text-destructive">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">{t("failed_to_load_student_grades")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error?.message || t("please_try_again")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};