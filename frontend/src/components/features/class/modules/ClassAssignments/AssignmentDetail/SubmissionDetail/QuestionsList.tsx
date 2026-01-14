"use client";

import React, { useMemo } from "react";
import { FileText } from "lucide-react";
import { QuestionItem } from "./QuestionItem";
import { QuizNavigator } from "../QuizSubmission/QuizNavigator";
import { QuizNavigatorSheet } from "../QuizSubmission/QuizNavigatorSheet";
import type { QuizAnswer, QuizQuestion } from "@/types/quiz";

interface QuestionsListProps {
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  answeredQuestions: Set<number>;
  currentQuestionIndex: number;
  onQuestionClick: (index: number) => void;
  t: (key: string) => string;
}

export const QuestionsList = ({ 
  questions, 
  answers,
  answeredQuestions,
  currentQuestionIndex,
  onQuestionClick,
  t
}: QuestionsListProps) => {
  // Tạo map để tra cứu câu trả lời theo quizQuestionId
  const answerMap = useMemo(() => {
    const map = new Map<number, QuizAnswer>();
    answers.forEach((answer) => {
      map.set(answer.quizQuestionId, answer);
    });
    return map;
  }, [answers]);

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("no_questions_available")}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <h3 className="text-lg sm:text-xl font-medium text-foreground flex items-center gap-2">
        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        {t("question_answer_details_title")}
      </h3>

      {/* Questions List with Navigator */}
      {/* eslint-disable-next-line design-system/use-design-tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 sm:gap-6">
        {/* Questions List */}
        <div className="space-y-4 sm:space-y-6">
          {questions.map((question, index) => (
            <div key={question.id || index} id={`question-${index}`}>
              <QuestionItem
                question={question}
                answer={question.id ? answerMap.get(question.id) : undefined}
                questionIndex={index}
              />
            </div>
          ))}
        </div>

        {/* Quiz Navigator Sidebar - Desktop */}
        <div className="hidden lg:block">
          <QuizNavigator
            totalQuestions={questions.length}
            answeredQuestions={answeredQuestions}
            currentQuestion={currentQuestionIndex + 1}
            onQuestionClick={onQuestionClick}
            onSubmit={() => {}}
            isSubmitting={false}
            canSubmit={false}
            t={t}
            isTeacher={true}
          />
        </div>
      </div>

      {/* Mobile/Tablet: Floating Button + Bottom Sheet */}
      <QuizNavigatorSheet
        totalQuestions={questions.length}
        answeredQuestions={answeredQuestions}
        currentQuestion={currentQuestionIndex + 1}
        onQuestionClick={onQuestionClick}
        onSubmit={() => {}}
        isSubmitting={false}
        canSubmit={false}
        t={t}
        isTeacher={true}
      />
    </div>
  );
};
