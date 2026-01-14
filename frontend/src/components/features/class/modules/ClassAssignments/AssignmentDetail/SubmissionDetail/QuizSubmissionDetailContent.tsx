"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import type { AssignmentDetailResponse } from "@/types/assignment";
import type { SubmissionResponse } from "@/types/submission";
import type { QuizSubmissionStats } from "@/schemas/submissionSchema";
import { SubmissionHeader } from "./SubmissionHeader";
import { SubmissionStatsCard } from "./SubmissionStatsCard";
import { QuestionsList } from "./QuestionsList";
import { GradingSection } from "./GradingSection";

interface QuizSubmissionDetailContentProps {
  submission: SubmissionResponse;
  assignment: AssignmentDetailResponse;
  stats: QuizSubmissionStats | null;
  classId: number;
  assignmentId: number;
  isTeacher: boolean;
}

export const QuizSubmissionDetailContent = ({
  submission,
  assignment,
  stats,
  classId,
  assignmentId,
  isTeacher,
}: QuizSubmissionDetailContentProps) => {
  const t = useTranslations();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Build answered questions set
  const answeredQuestions = useMemo(() => {
    const questions = assignment.listQuestions || [];
    const answers = submission.answers || [];
    return new Set<number>(
      questions
        .map((q, index) => {
          const answer = answers.find(a => a.quizQuestionId === q.id);
          return answer && answer.selectedOptionIds && answer.selectedOptionIds.length > 0 ? index + 1 : null;
        })
        .filter((n): n is number => n !== null)
    );
  }, [assignment.listQuestions, submission.answers]);

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
    // Scroll to question
    const questionElement = document.getElementById(`question-${index}`);
    questionElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Thông tin học viên và bài nộp */}
      <Card className="p-4 sm:p-6">
        <SubmissionHeader
          classId={classId}
          classMemberId={submission.submitById}
          submitByName={submission.submitByName}
          submitByAvatarUrl={submission.submitByAvatarUrl}
          submittedTime={submission.submittedTime}
          status={submission.status}
          grade={submission.grade}
          maxScore={assignment.maxScore}
        />

        {/* Thống kê tổng quan */}
        {stats && <SubmissionStatsCard stats={stats} />}
      </Card>

      {/* Chi tiết từng câu hỏi và câu trả lời */}
      <QuestionsList
        questions={assignment.listQuestions || []}
        answers={submission.answers || []}
        answeredQuestions={answeredQuestions}
        currentQuestionIndex={currentQuestionIndex}
        onQuestionClick={handleQuestionClick}
        t={t}
      />

      {/* Grading Section - visible to teacher for grading or student if already graded */}
      <GradingSection
        submissionId={submission.id}
        assignmentId={assignmentId}
        classId={classId}
        maxScore={assignment.maxScore}
        currentGrade={submission.grade}
        isTeacher={isTeacher}
      />
    </div>
  );
};