import { useState, useCallback, useEffect } from "react";

interface QuizAnswer {
  questionId: number;
  selectedOptions: number[];
}

const STORAGE_KEY_PREFIX = "quiz_answers_";

function getStorageKey(assignmentId: number, classId: number): string {
  return `${STORAGE_KEY_PREFIX}${classId}_${assignmentId}`;
}

function loadAnswersFromStorage(
  assignmentId: number,
  classId: number
): QuizAnswer[] {
  if (typeof window === "undefined") return [];

  try {
    const key = getStorageKey(assignmentId, classId);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load quiz answers from storage:", error);
  }
  return [];
}

function saveAnswersToStorage(
  assignmentId: number,
  classId: number,
  answers: QuizAnswer[]
): void {
  if (typeof window === "undefined") return;

  try {
    const key = getStorageKey(assignmentId, classId);
    localStorage.setItem(key, JSON.stringify(answers));
  } catch (error) {
    console.error("Failed to save quiz answers to storage:", error);
  }
}

export function clearQuizAnswersFromStorage(
  assignmentId: number,
  classId: number
): void {
  if (typeof window === "undefined") return;

  try {
    const key = getStorageKey(assignmentId, classId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear quiz answers from storage:", error);
  }
}

interface UseQuizAnswersProps {
  assignmentId: number;
  classId: number;
  hasSubmitted: boolean;
}

export function useQuizAnswers({
  assignmentId,
  classId,
  hasSubmitted,
}: UseQuizAnswersProps) {
  const [answers, setAnswers] = useState<QuizAnswer[]>(() => {
    // Load from localStorage on initial mount
    if (!hasSubmitted) {
      return loadAnswersFromStorage(assignmentId, classId);
    }
    return [];
  });

  // Save to localStorage whenever answers change
  useEffect(() => {
    if (!hasSubmitted && answers.length > 0) {
      saveAnswersToStorage(assignmentId, classId, answers);
    }
  }, [answers, assignmentId, classId, hasSubmitted]);

  // Clear storage when submitted
  useEffect(() => {
    if (hasSubmitted) {
      clearQuizAnswersFromStorage(assignmentId, classId);
      setAnswers([]);
    }
  }, [hasSubmitted, assignmentId, classId]);

  const handleSingleChoiceChange = useCallback(
    (questionId: number, optionId: number) => {
      setAnswers((prev) => {
        const existing = prev.find((a) => a.questionId === questionId);
        if (existing) {
          return prev.map((a) =>
            a.questionId === questionId
              ? { ...a, selectedOptions: [optionId] }
              : a
          );
        } else {
          return [...prev, { questionId, selectedOptions: [optionId] }];
        }
      });
    },
    []
  );

  const handleMultipleChoiceChange = useCallback(
    (questionId: number, optionId: number, checked: boolean) => {
      setAnswers((prev) => {
        const existing = prev.find((a) => a.questionId === questionId);
        if (existing) {
          const newOptions = checked
            ? [...existing.selectedOptions, optionId]
            : existing.selectedOptions.filter((id) => id !== optionId);

          return prev.map((a) =>
            a.questionId === questionId
              ? { ...a, selectedOptions: newOptions }
              : a
          );
        } else {
          return [
            ...prev,
            { questionId, selectedOptions: checked ? [optionId] : [] },
          ];
        }
      });
    },
    []
  );

  const getAnswerForQuestion = useCallback(
    (questionId: number): number[] => {
      const answer = answers.find((a) => a.questionId === questionId);
      return answer?.selectedOptions || [];
    },
    [answers]
  );

  const isQuestionAnswered = useCallback(
    (questionId: number): boolean => {
      const selectedOptions = getAnswerForQuestion(questionId);
      return selectedOptions.length > 0;
    },
    [getAnswerForQuestion]
  );

  return {
    answers,
    handleSingleChoiceChange,
    handleMultipleChoiceChange,
    getAnswerForQuestion,
    isQuestionAnswered,
  };
}
