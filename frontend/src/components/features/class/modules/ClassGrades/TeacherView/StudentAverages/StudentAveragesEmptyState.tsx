import React from "react";
import { useTranslations } from "next-intl";
import { User } from "lucide-react";

interface StudentAveragesEmptyStateProps {
  hasSearchTerm: boolean;
}

export const StudentAveragesEmptyState = ({
  hasSearchTerm,
}: StudentAveragesEmptyStateProps) => {
  const t = useTranslations();

  return (
    <div className="text-center text-muted-foreground py-12">
      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p className="font-medium">{t("no_students_found")}</p>
      {hasSearchTerm && (
        <p className="text-sm mt-1">{t("change_search_keywords")}</p>
      )}
    </div>
  );
};