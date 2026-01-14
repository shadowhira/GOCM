"use client";

import * as React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DateTimePicker from "@/components/ui/date-time-picker";
import { FileText } from "lucide-react";
import { AssignmentType } from "@/types/constants";

interface AssignmentBasicInfoProps {
  form: UseFormReturn<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  hideType?: boolean;
  typeLabel?: string;
  assignmentType?: AssignmentType;
}

export function AssignmentBasicInfo({
  form,
  hideType = false,
  typeLabel,
  assignmentType,
}: AssignmentBasicInfoProps) {
  const t = useTranslations();

  const isQuiz = assignmentType === AssignmentType.Quiz;

  // Watch listQuestions for quiz type - use deep watch
  const listQuestions = form.watch("listQuestions");

  // Calculate total score from questions for quiz
  const totalScore = React.useMemo(() => {
    if (!isQuiz || !listQuestions || !Array.isArray(listQuestions)) return 0;
    return listQuestions.reduce((sum: number, q: { point?: number }) => {
      const point = typeof q.point === "number" ? q.point : 0;
      return sum + point;
    }, 0);
  }, [isQuiz, listQuestions]);

  // Update maxScore in form when totalScore changes (for quiz only)
  React.useEffect(() => {
    if (isQuiz) {
      form.setValue("maxScore", totalScore);
    }
  }, [isQuiz, totalScore, form]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          {t("basic_information")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assignment Type Label (if provided) */}
        {!hideType && typeLabel && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-primary">{typeLabel}</p>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium block">
            {t("title")} <span className="text-destructive">*</span>
          </label>
          <Input
            {...form.register("title")}
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
            {...form.register("content")}
            placeholder={t("assignment_description_placeholder")}
            rows={4}
            className={cn(
              form.formState.errors.content && "border-destructive"
            )}
          />
          {form.formState.errors.content && (
            <p className="text-sm text-destructive">
              {t(String(form.formState.errors.content.message))}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deadline */}
          <Controller
            name="deadline"
            control={form.control}
            render={({ field }) => (
              <DateTimePicker
                value={field.value ? field.value.toISOString() : ""}
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

          {/* Max Score */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {t("max_score")} <span className="text-destructive">*</span>
            </label>
            {isQuiz ? (
              <div className="relative">
                <Input
                  type="number"
                  value={totalScore}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("auto_calculated_from_questions")}
                </p>
              </div>
            ) : (
              <Input
                {...form.register("maxScore", { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.1"
                placeholder="10"
                className={cn(
                  form.formState.errors.maxScore && "border-destructive"
                )}
              />
            )}
            {form.formState.errors.maxScore && (
              <p className="text-sm text-destructive">
                {t(String(form.formState.errors.maxScore.message))}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
