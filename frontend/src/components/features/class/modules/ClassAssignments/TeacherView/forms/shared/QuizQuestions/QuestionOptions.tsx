"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuestionType } from "@/types/constants";
import { QuestionOption } from "./QuestionOption";
import type { QuizQuestionFormValues } from "./types";

interface QuestionOptionsProps {
  form: UseFormReturn<QuizQuestionFormValues>;
  questionIndex: number;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
}

export function QuestionOptions({
  form,
  questionIndex,
  onAddOption,
  onRemoveOption,
}: QuestionOptionsProps) {
  const t = useTranslations();
  const options = form.watch(`listQuestions.${questionIndex}.options`) || [];
  const questionType = form.watch(
    `listQuestions.${questionIndex}.questionType`
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{t("options")}</label>
        <p className="text-xs text-muted-foreground">
          {questionType === QuestionType.SingleChoice
            ? t("select_one_correct_answer")
            : t("select_multiple_correct_answers")}
        </p>
      </div>
      <div className="space-y-3">
        {options.map((_: unknown, optionIndex: number) => (
          <QuestionOption
            key={optionIndex}
            form={form}
            questionIndex={questionIndex}
            optionIndex={optionIndex}
            onRemove={() => onRemoveOption(optionIndex)}
            canRemove={options.length > 2}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddOption}
        disabled={options.length >= 6}
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("add_option")}
      </Button>
    </div>
  );
}
