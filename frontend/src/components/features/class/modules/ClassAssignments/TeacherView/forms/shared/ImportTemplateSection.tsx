"use client";

import { useTranslations } from "next-intl";
import { Download, FileSpreadsheet, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ImportTemplateSection() {
  const t = useTranslations();

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/templates/assignment_template.xlsx";
    link.download = "assignment_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          {t("excel_template")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description Alert */}
        <div className="flex items-center justify-center gap-4 w-full rounded-md border border-primary/20 bg-primary/5 p-4">
          <Info className="h-5 w-5 flex-shrink-0 text-primary" />
          <p className="text-sm leading-5 text-center">
            {t("excel_template_description")}
          </p>
        </div>

        {/* Format Requirements */}
        <div className="space-y-3">
          <p className="text-sm font-medium">{t("excel_format_required")}</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded font-medium">
                QuestionText
              </code>
              <span className="flex-1 leading-relaxed pt-0.5">
                {t("excel_column_question_text")}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded font-medium">
                Options A-D
              </code>
              <span className="flex-1 leading-relaxed pt-0.5">
                {t("excel_column_options")}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded font-medium">
                CorrectOption
              </code>
              <span className="flex-1 leading-relaxed pt-0.5">
                {t("excel_column_correct_option")}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded font-medium">
                Point
              </code>
              <span className="flex-1 leading-relaxed pt-0.5">
                {t("excel_column_point")}
              </span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handleDownloadTemplate}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          {t("download_template")}
        </Button>
      </CardContent>
    </Card>
  );
}
