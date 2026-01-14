"use client";

import * as React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionType } from "@/types/constants";
import type { QuizQuestionFormValues } from "./types";

interface QuestionFieldsProps {
  form: UseFormReturn<QuizQuestionFormValues>;
  questionIndex: number;
}

export function QuestionFields({ form, questionIndex }: QuestionFieldsProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("question_text")}</label>
        <Input
          {...form.register(`listQuestions.${questionIndex}.questionText`)}
          placeholder={t("enter_question")}
        />
      </div>

      {/* Question Type and Point */}
      <div className="grid grid-cols-2 gap-4">
        {/* Question Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("question_type")}</label>
          <Controller
            name={`listQuestions.${questionIndex}.questionType`}
            control={form.control}
            render={({ field }) => (
              <Select
                value={(field.value ?? QuestionType.SingleChoice).toString()}
                onValueChange={(value) =>
                  field.onChange(parseInt(value) as QuestionType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.SingleChoice.toString()}>
                    {t("single_choice")}
                  </SelectItem>
                  <SelectItem value={QuestionType.MultipleChoice.toString()}>
                    {t("multiple_choice")}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Point */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("point")}</label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            {...form.register(`listQuestions.${questionIndex}.point`, {
              valueAsNumber: true,
            })}
            placeholder={t("enter_point")}
          />
        </div>
      </div>
    </div>
  );
}
