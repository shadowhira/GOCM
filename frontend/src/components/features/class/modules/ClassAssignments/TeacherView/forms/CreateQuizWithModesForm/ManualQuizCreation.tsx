"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { QuizQuestions } from "../shared/export";
import { CreateAssignmentFormData, UpdateAssignmentFormData } from "@/schemas/assignmentSchema";

type AssignmentFormData = CreateAssignmentFormData | UpdateAssignmentFormData;

interface ManualQuizCreationProps {
  form: UseFormReturn<AssignmentFormData>;
}

export function ManualQuizCreation({ form }: ManualQuizCreationProps) {
  return (
    <div className="space-y-4">
      <QuizQuestions form={form} />
    </div>
  );
}
