"use client";

import * as React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { QuestionType } from "@/types/constants";
import type { QuizQuestionFormValues } from "./types";

interface QuestionOptionProps {
  form: UseFormReturn<QuizQuestionFormValues>;
  questionIndex: number;
  optionIndex: number;
  onRemove: () => void;
  canRemove: boolean;
}

export function QuestionOption({
  form,
  questionIndex,
  optionIndex,
  onRemove,
  canRemove,
}: QuestionOptionProps) {
  const t = useTranslations();
  const isCorrect = form.watch(
    `listQuestions.${questionIndex}.options.${optionIndex}.isCorrect`
  );

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg border-2 transition-all cursor-pointer",
        isCorrect
          ? "bg-green-500/20 border-green-500 shadow-md"
          : "bg-muted/20 border-border hover:border-primary/50"
      )}
    >
      <Controller
        name={`listQuestions.${questionIndex}.options.${optionIndex}.isCorrect`}
        control={form.control}
        render={({ field }) => {
          const questionType = form.watch(
            `listQuestions.${questionIndex}.questionType`
          );
          const isSingleChoice = questionType === QuestionType.SingleChoice;

          const handleClick = () => {
            const newValue = !field.value;
            if (isSingleChoice && newValue) {
              const currentOptions =
                form.watch(`listQuestions.${questionIndex}.options`) || [];
              currentOptions.forEach((_: unknown, idx: number) => {
                if (idx !== optionIndex) {
                  form.setValue(
                    `listQuestions.${questionIndex}.options.${idx}.isCorrect`,
                    false
                  );
                }
              });
            }
            field.onChange(newValue);
          };

          return (
            <div
              onClick={handleClick}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span
                className={cn(
                  "font-mono text-sm font-medium min-w-[24px]",
                  isCorrect ? "text-green-600" : "text-muted-foreground"
                )}
              >
                {String.fromCharCode(65 + optionIndex)}.
              </span>
            </div>
          );
        }}
      />
      <Input
        {...form.register(
          `listQuestions.${questionIndex}.options.${optionIndex}.optionText`
        )}
        placeholder={t("option_text")}
        className={cn(
          "flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent",
          isCorrect && "font-medium"
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={!canRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
