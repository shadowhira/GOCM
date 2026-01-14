"use client";

import * as React from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FileText, Upload, Sparkles, AlertTriangle, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGenerateQuizFromFile } from "@/queries/quizQueries";
import { AIParametersSection, QuizQuestions } from "../shared/export";
import {
  aiQuizFromFileSchema,
  type AIQuizFromFileFormData,
  type CreateAssignmentFormData,
  type UpdateAssignmentFormData,
} from "@/schemas/assignmentSchema";
import type { GenerateFromFileResponse, QueryRelevanceInfo } from "@/types/quiz";

type AssignmentFormData = CreateAssignmentFormData | UpdateAssignmentFormData;

interface AIDocumentQuizProps {
  form: UseFormReturn<AssignmentFormData>;
}

export function AIDocumentQuiz({ form }: AIDocumentQuizProps) {
  const t = useTranslations();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // State for handling query relevance warning
  const [showWarningDialog, setShowWarningDialog] = React.useState(false);
  const [pendingResponse, setPendingResponse] = React.useState<GenerateFromFileResponse | null>(null);
  const [queryRelevance, setQueryRelevance] = React.useState<QueryRelevanceInfo | null>(null);

  const aiForm = useForm<AIQuizFromFileFormData>({
    resolver: zodResolver(aiQuizFromFileSchema),
    defaultValues: {
      difficulty_distribution: { easy: 3, medium: 2, hard: 1 },
      question_type_distribution: { single: 3, multiple: 3 },
      language: "vi",
      total_points: 10,
      point_strategy: "equal",
      prompt: "",
    },
  });

  const generateFromFileMutation = useGenerateQuizFromFile({
    onError: (err: Error) => {
      console.error(err);
      toast.error(err.message || t("failed_to_generate"));
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      aiForm.setValue("file", file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error(t("please_upload_file"));
      return;
    }

    const isValid = await aiForm.trigger();
    if (!isValid) {
      return;
    }

    const formData = aiForm.getValues();
    const params = {
      difficulty_distribution: formData.difficulty_distribution,
      question_type_distribution: formData.question_type_distribution,
      language: formData.language,
      total_points: formData.total_points,
      point_strategy: formData.point_strategy,
      prompt: formData.prompt || undefined,
    };

    const resp = await generateFromFileMutation.mutateAsync({
      file: selectedFile,
      params,
    });

    // Check if there's a query relevance warning
    if (resp && resp.query_relevance?.warning_message) {
      // Store the response and show warning dialog
      setPendingResponse(resp);
      setQueryRelevance(resp.query_relevance);
      setShowWarningDialog(true);
    } else if (resp && resp.questions) {
      // No warning, proceed normally
      form.setValue("listQuestions", resp.questions);
      toast.success(t("generated_questions_success"));
    }
  };

  // Handle user choosing to continue with current results
  const handleContinueWithResults = () => {
    if (pendingResponse && pendingResponse.questions) {
      form.setValue("listQuestions", pendingResponse.questions);
      toast.success(t("generated_questions_success"));
    }
    // Clear state
    setShowWarningDialog(false);
    setPendingResponse(null);
    setQueryRelevance(null);
  };

  // Handle user choosing to re-enter prompt
  const handleReenterPrompt = () => {
    // Clear state but keep the file
    setShowWarningDialog(false);
    setPendingResponse(null);
    setQueryRelevance(null);
    // Focus on prompt input
    const promptInput = document.getElementById("ai-doc-prompt");
    if (promptInput) {
      promptInput.focus();
    }
  };

  // Get warning severity based on relevance score
  const getWarningSeverity = (relevanceInfo: QueryRelevanceInfo | null) => {
    if (!relevanceInfo) return "info";
    if (!relevanceInfo.is_relevant) return "destructive";
    if (relevanceInfo.relevance_score < 0.5) return "warning";
    return "info";
  };

  return (
    <>
      {(form.watch("listQuestions"))?.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {t("ai_document_mode")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("upload_file")}</h4>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {selectedFile ? selectedFile.name : t("choose_file")}
                </p>
              </div>
              {selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="w-full"
                >
                  {t("remove")}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-doc-prompt">
                {t("prompt")} ({t("optional")})
              </Label>
              <Textarea
                id="ai-doc-prompt"
                {...aiForm.register("prompt")}
                rows={3}
                placeholder={t("enter_prompt_for_ai")}
              />
            </div>

            <AIParametersSection form={aiForm} t={t} />

            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generateFromFileMutation.isPending || !selectedFile}
              className="w-full"
            >
              {generateFromFileMutation.isPending ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("generate_questions")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <QuizQuestions form={form} />
      )}

      {/* Query Relevance Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {t("query_relevance_warning_title")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {/* Warning message from backend */}
                <Alert variant={getWarningSeverity(queryRelevance) as "default" | "destructive"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("warning")}</AlertTitle>
                  <AlertDescription>
                    {queryRelevance?.warning_message || t("query_relevance_generic_warning")}
                  </AlertDescription>
                </Alert>

                {/* Relevance score indicator */}
                {queryRelevance && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("relevance_score")}</span>
                      <span className="font-medium">
                        {Math.round(queryRelevance.relevance_score * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          queryRelevance.relevance_score >= 0.65
                            ? "bg-green-500"
                            : queryRelevance.relevance_score >= 0.35
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${queryRelevance.relevance_score * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("strategy_used")}: {queryRelevance.strategy_used}
                    </p>
                  </div>
                )}

                {/* Generated questions info */}
                {pendingResponse && (
                  <p className="text-sm text-muted-foreground">
                    {t("generated_questions_count", { count: pendingResponse.total_questions })}
                  </p>
                )}

                <p className="text-sm font-medium">
                  {t("query_relevance_choice_question")}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={handleReenterPrompt} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("reenter_prompt")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinueWithResults} className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              {t("continue_with_results")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}