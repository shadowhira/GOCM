"use client";

import * as React from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGenerateQuizFromPrompt } from "@/queries/quizQueries";
import { AIParametersSection, QuizQuestions } from "../shared/export";
import {
  aiQuizFromPromptSchema,
  type AIQuizFromPromptFormData,
  type CreateAssignmentFormData,
  type UpdateAssignmentFormData,
} from "@/schemas/assignmentSchema";

type AssignmentFormData = CreateAssignmentFormData | UpdateAssignmentFormData;

interface AIPromptQuizProps {
  form: UseFormReturn<AssignmentFormData>;
}

export function AIPromptQuiz({ form }: AIPromptQuizProps) {
  const t = useTranslations();

  const aiForm = useForm<AIQuizFromPromptFormData>({
    resolver: zodResolver(aiQuizFromPromptSchema),
    defaultValues: {
      prompt: "",
      difficulty_distribution: { easy: 3, medium: 2, hard: 1 },
      question_type_distribution: { single: 3, multiple: 3 },
      language: "vi",
      total_points: 10,
      point_strategy: "equal",
    },
  });

  const generateFromPromptMutation = useGenerateQuizFromPrompt({
    onError: (err: Error) => {
      console.error(err);
      toast.error(err.message || t("failed_to_generate"));
    },
  });

  const handleGenerate = async () => {
    const isValid = await aiForm.trigger();
    if (!isValid) {
      return;
    }

    const data = aiForm.getValues();
    const resp = await generateFromPromptMutation.mutateAsync(data);
    if (resp && resp.questions) {
      form.setValue("listQuestions", resp.questions);
      toast.success(t("generated_questions_success"));
    }
  };

  return (
    <>
      {(form.watch("listQuestions"))?.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t("ai_prompt_mode")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">{t("prompt")}</Label>
              <Textarea
                id="ai-prompt"
                {...aiForm.register("prompt")}
                rows={4}
                placeholder={t("enter_prompt_for_ai")}
              />
              {aiForm.formState.errors.prompt && (
                <p className="text-sm text-destructive">
                  {aiForm.formState.errors.prompt.message}
                </p>
              )}
            </div>

            <AIParametersSection form={aiForm} t={t} />

            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generateFromPromptMutation.isPending}
              className="w-full"
            >
              {generateFromPromptMutation.isPending ? (
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
    </>
  );
}