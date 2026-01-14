"use client";

import * as React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { QuestionType } from "@/types/constants";
import type { CreateAssignmentFormData, UpdateAssignmentFormData } from "@/schemas/assignmentSchema";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { EmptyState } from "./EmptyState";
import { AddQuestionButton } from "./AddQuestionButton";
import { QuizNavigator } from "./QuizNavigator";
import { QuizNavigatorSheet } from "./QuizNavigatorSheet";
import type { QuizQuestionFormValues } from "./types";

// Union type để support cả create và update form
type AssignmentFormData = CreateAssignmentFormData | UpdateAssignmentFormData;

interface QuizQuestionsProps {
  form: UseFormReturn<AssignmentFormData>;
}

export function QuizQuestions({ form }: QuizQuestionsProps) {
  const t = useTranslations();
  const [currentQuestion, setCurrentQuestion] = React.useState<number>();
  const questionRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: form.control,
    name: "listQuestions",
  });

  const getQuestionStatus = React.useCallback(
    (index: number): "complete" | "incomplete" | "error" => {
      const questions = form.getValues("listQuestions") || [];
      const question = questions[index];

      if (!question) return "incomplete";

      const errors = form.formState.errors?.listQuestions;
      if (errors?.[index]) return "error";

      const hasQuestionText = question.questionText?.trim();
      const hasValidOptions = question.options?.some((opt) =>
        opt.optionText?.trim()
      );
      const hasCorrectAnswer = question.options?.some((opt) => opt.isCorrect);

      if (hasQuestionText && hasValidOptions && hasCorrectAnswer) {
        return "complete";
      }

      return "incomplete";
    },
    [form]
  );

  const addQuestion = () => {
    appendQuestion({
      questionText: "",
      questionType: QuestionType.SingleChoice,
      point: 1,
      options: [
        { optionText: "", isCorrect: true },
        { optionText: "", isCorrect: false },
      ],
    });
    // Scroll to new question after it's added
    setTimeout(() => {
      const newIndex = questionFields.length;
      scrollToQuestion(newIndex);
    }, 100);
  };

  const handleRemoveQuestion = (index: number) => {
    removeQuestion(index);
    if (currentQuestion === index) {
      setCurrentQuestion(undefined);
    }
  };

  const scrollToQuestion = (index: number) => {
    setCurrentQuestion(index);
    const element = questionRefs.current[index];
    if (element) {
      // Check if we're in a modal/dialog with overflow
      const scrollableParent =
        element.closest('[role="dialog"]') ||
        element.closest(".overflow-auto") ||
        element.closest(".overflow-y-auto");

      if (scrollableParent) {
        // Scroll within the modal/container
        const elementTop = element.offsetTop;
        const offset = 100;
        scrollableParent.scrollTo({
          top: elementTop - offset,
          behavior: "smooth",
        });
      } else {
        // Scroll the window
        const yOffset = -100;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  // Update current question on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      if (questionRefs.current.length === 0) return;

      const scrollPosition = window.scrollY + 200;

      for (let i = questionRefs.current.length - 1; i >= 0; i--) {
        const element = questionRefs.current[i];
        if (element && element.offsetTop <= scrollPosition) {
          setCurrentQuestion(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [questionFields.length]);

  const addOption = (questionIndex: number) => {
    const currentQuestions = form.getValues("listQuestions") || [];
    const question = currentQuestions[questionIndex];
    if (question && question.options && question.options.length < 6) {
      const newOptions = [
        ...question.options,
        { optionText: "", isCorrect: false },
      ];
      form.setValue(`listQuestions.${questionIndex}.options`, newOptions);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestions = form.getValues("listQuestions") || [];
    const question = currentQuestions[questionIndex];
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter(
        (_, idx) => idx !== optionIndex
      );
      form.setValue(`listQuestions.${questionIndex}.options`, newOptions);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Quiz Navigator - Desktop: Sidebar */}
      {questionFields.length > 0 && (
        <div className="hidden lg:block lg:w-64 xl:w-72">
          <QuizNavigator
            totalQuestions={questionFields.length}
            currentQuestion={currentQuestion}
            onQuestionClick={scrollToQuestion}
            onAddQuestion={addQuestion}
            getQuestionStatus={getQuestionStatus}
          />
        </div>
      )}

      {/* Quiz Navigator - Mobile/Tablet: Floating Button + Bottom Sheet */}
      {questionFields.length > 0 && (
        <QuizNavigatorSheet
          totalQuestions={questionFields.length}
          currentQuestion={currentQuestion ?? 0}
          onQuestionClick={scrollToQuestion}
          onAddQuestion={addQuestion}
          getQuestionStatus={getQuestionStatus}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              {t("quiz_questions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionFields.map((field, questionIndex) => (
                <div
                  key={field.id}
                  ref={(el) => {
                    questionRefs.current[questionIndex] = el;
                  }}
                >
                  <QuizQuestionCard
                    form={form as unknown as UseFormReturn<QuizQuestionFormValues>}
                    questionIndex={questionIndex}
                    onRemove={() => handleRemoveQuestion(questionIndex)}
                    onAddOption={() => addOption(questionIndex)}
                    onRemoveOption={(optionIndex) =>
                      removeOption(questionIndex, optionIndex)
                    }
                  />
                </div>
              ))}

              {questionFields.length > 0 && (
                <AddQuestionButton onAddQuestion={addQuestion} />
              )}

              {questionFields.length === 0 && (
                <EmptyState onAddQuestion={addQuestion} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}