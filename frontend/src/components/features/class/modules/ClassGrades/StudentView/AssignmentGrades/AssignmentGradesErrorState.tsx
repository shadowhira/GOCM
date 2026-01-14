import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const AssignmentGradesErrorState = () => {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          {t("error_loading_grades")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {t("error_loading_grades_description")}
        </p>
      </CardContent>
    </Card>
  );
};