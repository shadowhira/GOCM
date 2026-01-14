import type { GeneratedQuizQuestion } from "@/types/quiz";

/**
 * Maps AI-generated quiz questions to form-compatible format
 */
export function mapResponseQuestionsToForm(questions: GeneratedQuizQuestion[]) {
  return questions.map((q) => ({
    questionText: q.questionText || "",
    questionType: q.questionType || 0,
    point: typeof q.point === "number" ? q.point : Number(q.point) || 1,
    options: (q.options || []).map((o) => ({
      optionText: o.optionText || "",
      isCorrect: !!o.isCorrect,
    })),
  }));
}
