import type { FieldValues } from "react-hook-form";
import type { QuizQuestionFormData } from "@/schemas/assignmentSchema";

export interface QuizQuestionFormValues extends FieldValues {
  listQuestions?: QuizQuestionFormData[];
}
