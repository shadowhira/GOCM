import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface AssignmentGradesEmptyStateProps {
  hasSearchTerm: boolean;
  hasFilteredResults: boolean;
}

export const AssignmentGradesEmptyState = ({
  hasSearchTerm,
  hasFilteredResults,
}: AssignmentGradesEmptyStateProps) => {
  const t = useTranslations();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center text-muted-foreground py-8">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">
            {hasFilteredResults 
              ? t("no_results_on_page")
              : t("no_assignments_found")
            }
          </p>
          <p className="text-sm mt-1">
            {hasSearchTerm
              ? t("try_different_search")
              : t("no_graded_assignments_yet")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};