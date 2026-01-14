import React from "react";
import { useTranslations } from "next-intl";

interface GradeOverviewHeaderProps {
  className: string;
}

export const GradeOverviewHeader = ({ className }: GradeOverviewHeaderProps) => {
  const t = useTranslations();

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {t("grade_overview_title")}
      </h2>
      <p className="text-muted-foreground">
        {t("grade_overview_description", { className })}
      </p>
    </div>
  );
};