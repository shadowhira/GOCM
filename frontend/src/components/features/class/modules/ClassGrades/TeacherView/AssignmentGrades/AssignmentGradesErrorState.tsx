import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const AssignmentGradesErrorState = () => {
  const t = useTranslations();

  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="text-center text-destructive">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">{t("failed_to_load_assignment_grades")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("please_try_again_later")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};