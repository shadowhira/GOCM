"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportTemplateSection, QuizQuestions } from "../shared/export";
import { useGenerateQuizFromFileExcel } from "@/queries/quizQueries";
import type {
  CreateAssignmentFormData,
  UpdateAssignmentFormData,
} from "@/schemas/assignmentSchema";

type AssignmentFormData = CreateAssignmentFormData | UpdateAssignmentFormData;

interface ExcelImportQuizProps {
  form: UseFormReturn<AssignmentFormData>;
}

export function ExcelImportQuiz({ form }: ExcelImportQuizProps) {
  const t = useTranslations();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { mutateAsync: generateQuizFromExcel, isPending: isProcessing } =
    useGenerateQuizFromFileExcel({
      onSuccess: (data) => {
        if (data && Array.isArray(data)) {
          form.setValue("listQuestions", data);
          toast.success(
            t("imported_questions_success", {
              count: data.length,
            })
          );
        } else {
          toast.warning(t("no_questions_found_in_file"));
        }
      },
      onError: (error) => {
        console.error("Error importing from Excel:", error);
        toast.error(t("failed_to_import_excel"));
      },
    });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error(t("please_upload_file"));
      return;
    }

    try {
      await generateQuizFromExcel({ excelFile: selectedFile });
    } catch (error) {
      // Error already handled in onError callback
      console.error("Import error:", error);
    }
  };

  return (
    <>
      {(form.watch("listQuestions"))?.length === 0 ? (
        <div className="space-y-6">
          {/* Template Download Section */}
          <ImportTemplateSection />

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                {t("excel_file")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {selectedFile
                    ? selectedFile.name
                    : t("click_to_upload_excel")}
                </p>
              </div>

              {selectedFile && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("remove")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleImport}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>{t("processing")}...</>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {t("import_questions")}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <QuizQuestions form={form} />
      )}
    </>
  );
}