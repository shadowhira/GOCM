"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Star, Save, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGradeSubmission } from "@/queries/gradeQueries";
import { toast } from "sonner";
import type { GradeResponse } from "@/types/grade";
import { useSearchParams } from "next/navigation";

interface GradingSectionProps {
  submissionId: number;
  assignmentId: number;
  classId: number;
  maxScore: number;
  currentGrade?: GradeResponse | null;
  isTeacher: boolean;
  onGradeSuccess?: () => void;
}

export const GradingSection = ({
  submissionId,
  assignmentId,
  classId,
  maxScore,
  currentGrade,
  isTeacher,
  onGradeSuccess,
}: GradingSectionProps): React.ReactElement | null => {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(isTeacher && !currentGrade);
  const [score, setScore] = useState(currentGrade?.score?.toString() || "");
  const [feedback, setFeedback] = useState(currentGrade?.feedback || "");
  const [isFocused, setIsFocused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { mutate: gradeSubmission, isPending } = useGradeSubmission();

  useEffect(() => {
    const focusType = searchParams.get("focus");
    if (focusType === "grade" && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setIsFocused(true);
      const timer = setTimeout(() => {
        setIsFocused(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Student without grade - don't show this section
  if (!isTeacher && !currentGrade) {
    return null;
  }

  const handleSave = () => {
    const numericScore = parseFloat(score);

    if (isNaN(numericScore) || numericScore < 0 || numericScore > maxScore) {
      toast.error(t("invalid_score"));
      return;
    }

    gradeSubmission(
      {
        submissionId,
        assignmentId,
        classId,
        data: {
          score: numericScore,
          feedback: feedback.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
        //   toast.success(t("grade_saved_successfully"));
          setIsEditing(false);
          onGradeSuccess?.();
        },
        onError: (error) => {
        //   toast.error(t("failed_to_save_grade"));
          console.error("Grading error:", error);
        },
      }
    );
  };

  const handleCancel = () => {
    setScore(currentGrade?.score?.toString() || "");
    setFeedback(currentGrade?.feedback || "");
    setIsEditing(false);
  };

  if (!isEditing && currentGrade) {
    // Display mode - when already graded
    return (
      <Card
        ref={sectionRef}
        className={`p-4 sm:p-6 transition-colors ${
          isFocused ? "duration-300 bg-success/60" : "duration-1000 bg-success/10"
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-success" />
              <h3 className="text-lg font-semibold text-foreground">
                {t("grading_result")}
              </h3>
            </div>
            {isTeacher && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                {t("edit_grade")}
              </Button>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-success">
              {currentGrade.score}
            </span>
            <span className="text-xl text-muted-foreground">/ {maxScore}</span>
          </div>

          {currentGrade.feedback && (
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">
                {t("teacher_feedback")}
              </Label>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-sm whitespace-pre-wrap">
                  {currentGrade.feedback}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Edit mode
  return (
    <Card
      ref={sectionRef}
      className="p-4 sm:p-6 border-primary/30 bg-primary/5 transition-all duration-300"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {currentGrade ? t("edit_grade") : t("grade_submission")}
          </h3>
        </div>

        <div className="space-y-4">
          {/* Score Input */}
          <div className="space-y-2">
            <Label htmlFor="score">{t("score")} *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="score"
                type="number"
                min={0}
                max={maxScore}
                step={0.5}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="0"
                className="w-24"
              />
              <span className="text-muted-foreground">/ {maxScore}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("enter_score_from_0_to", { max: maxScore })}
            </p>
          </div>

          {/* Feedback Input */}
          <div className="space-y-2">
            <Label htmlFor="feedback">
              {t("feedback")} ({t("optional")})
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t("enter_feedback_for_student")}
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={isPending || !score}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isPending ? t("saving") : t("save_grade")}
            </Button>
            {currentGrade && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                {t("cancel")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
