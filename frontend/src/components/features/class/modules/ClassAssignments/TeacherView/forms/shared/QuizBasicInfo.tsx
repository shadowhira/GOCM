"use client";

import * as React from "react";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DateTimePicker from "@/components/ui/date-time-picker";
import { FileText } from "lucide-react";

import type { QuizQuestionFormData } from "@/schemas/assignmentSchema";

interface QuizAssignmentFormValues extends FieldValues {
  title: string;
  content?: string;
  deadline: Date;
  listQuestions?: QuizQuestionFormData[];
}

interface QuizBasicInfoProps<T extends QuizAssignmentFormValues> {
  form: UseFormReturn<T>;
}

export function QuizBasicInfo<T extends QuizAssignmentFormValues>({
  form,
}: QuizBasicInfoProps<T>) {
  const t = useTranslations();

  // Calculate total score from questions - using useWatch for deep tracking
  const questions = useWatch({
    control: form.control,
    name: "listQuestions" as never,
  });

  const totalScore = React.useMemo(() => {
    if (!questions || !Array.isArray(questions)) return 0;
    return questions.reduce((sum, q) => sum + (q.point || 0), 0);
  }, [questions]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          {t("basic_information")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quiz Type Label */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-primary">{t("quiz")}</p>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium block">
            {t("title")} <span className="text-destructive">*</span>
          </label>
          <Input
            {...form.register("title" as never)}
            placeholder={t("assignment_title_placeholder")}
            className={cn(form.formState.errors.title && "border-destructive")}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">
              {t(String(form.formState.errors.title.message))}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium block">
            {t("description")}
          </label>
          <Textarea
            {...form.register("content" as never)}
            placeholder={t("assignment_description_placeholder")}
            rows={4}
          />
          {form.formState.errors.content && (
            <p className="text-sm text-destructive">
              {t(String(form.formState.errors.content.message))}
            </p>
          )}
        </div>

        {/* Deadline and Total Score in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deadline */}
          <Controller
            name={"deadline" as never}
            control={form.control}
            render={({ field }) => (
              <DateTimePicker
                value={
                  field.value
                    ? (field.value as unknown) instanceof Date
                      ? (field.value as Date).toISOString()
                      : field.value
                    : ""
                }
                onChange={(value: string) => field.onChange(new Date(value))}
                label={t("deadline")}
                error={
                  form.formState.errors.deadline
                    ? t(String(form.formState.errors.deadline.message))
                    : undefined
                }
                placeholder={t("pick_date")}
              />
            )}
          />

          {/* Total Score - Read Only */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {t("total_score")}
            </label>
            <Input value={totalScore} readOnly disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              {t("total_score_auto_calculated")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
