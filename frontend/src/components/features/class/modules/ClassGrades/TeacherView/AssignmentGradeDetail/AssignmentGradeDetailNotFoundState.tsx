import React from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const AssignmentGradeDetailNotFoundState = () => {
  const t = useTranslations();

  return (
    <Card className="p-8 text-center">
      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {t("data_not_found")}
      </h3>
      <p className="text-muted-foreground">
        {t("assignment_info_not_found")}
      </p>
    </Card>
  );
};