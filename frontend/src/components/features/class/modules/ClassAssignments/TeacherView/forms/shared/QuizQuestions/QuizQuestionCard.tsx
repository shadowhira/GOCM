"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuestionHeader } from "./QuestionHeader";
import { QuestionFields } from "./QuestionFields";
import { QuestionOptions } from "./QuestionOptions";
import type { QuizQuestionFormValues } from "./types";

interface QuizQuestionCardProps {
  form: UseFormReturn<QuizQuestionFormValues>;
  questionIndex: number;
  onRemove: () => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
}

export function QuizQuestionCard({
  form,
  questionIndex,
  onRemove,
  onAddOption,
  onRemoveOption,
}: QuizQuestionCardProps) {
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <QuestionHeader
          questionNumber={questionIndex + 1}
          onRemove={onRemove}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <QuestionFields form={form} questionIndex={questionIndex} />
        <QuestionOptions
          form={form}
          questionIndex={questionIndex}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
        />
      </CardContent>
    </Card>
  );
}
