import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StudentAverageGrade } from "@/types/grade";
import { CosmeticAvatar } from "@/components/features/cosmetics";

interface StudentGradeCardProps {
  student: StudentAverageGrade;
  classId: number;
}

export const StudentGradeCard = ({
  student,
  classId,
}: StudentGradeCardProps) => {
  const t = useTranslations();

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 80) return "text-blue-600 dark:text-blue-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeStatus = (score: number) => {
    if (score >= 9)
      return {
        label: t("grade_excellent"),
        color:
          "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
      };
    if (score >= 8)
      return {
        label: t("grade_good"),
        color:
          "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
      };
    if (score >= 7)
      return {
        label: t("grade_fair"),
        color:
          "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
      };
    if (score >= 6)
      return {
        label: t("grade_average"),
        color:
          "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
      };
    return {
      label: t("grade_poor"),
      color: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    };
  };

  // const getCompletionRate = (submitted: number, total: number) => {
  //   if (total === 0) return 0;
  //   return Math.round((submitted / total) * 100);
  // };

  // const getGradingProgress = (graded: number, submitted: number) => {
  //   if (submitted === 0) return 0;
  //   return Math.round((graded / submitted) * 100);
  // };

  // const completionRate = getCompletionRate(
  //   student.submittedCount,
  //   student.totalAssignments
  // );
  // const gradingProgress = getGradingProgress(
  //   student.gradedCount,
  //   student.submittedCount
  // );
  const status = getGradeStatus(student.averageScore);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:pt-6">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          {/* Header: Avatar + Name + Badge */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CosmeticAvatar
                classId={classId}
                classMemberId={student.studentId}
                avatarUrl={student.studentAvatarUrl}
                displayName={student.studentName || t("unknown")}
                size="md"
              />
              <h3 className="font-semibold text-foreground truncate">
                {student.studentName ||
                  `${t("student_id_prefix")}${student.studentId}`}
              </h3>
            </div>
            <Badge className={cn(status.color, "flex-shrink-0")}>{status.label}</Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t">
            {/* Average Score */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{t("average_score_column")}</div>
              <div
                className={cn(
                  "text-lg font-bold",
                  getGradeColor(student.averageScore)
                )}
              >
                {student.averageScore.toFixed(1)}
              </div>
            </div>

            {/* Submitted Count */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{t("submitted_column")}</div>
              <div className="text-base font-semibold text-foreground">
                {student.submittedCount}/{student.totalAssignments}
              </div>
            </div>

            {/* Graded Count */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{t("graded_column")}</div>
              <div className="text-base font-semibold text-foreground">
                {student.gradedCount}/{student.submittedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-5 gap-4 items-center">
          {/* Student Info */}
          <div className="flex space-x-2 items-center col-span-1">
            <CosmeticAvatar
              classId={classId}
              classMemberId={student.studentId}
              avatarUrl={student.studentAvatarUrl}
              displayName={student.studentName || t("unknown")}
              size="sm"
            />
            <h3 className="font-semibold text-foreground truncate">
              {student.studentName ||
                `${t("student_id_prefix")}${student.studentId}`}
            </h3>
          </div>

          {/* Average Score */}
          <div className="text-center">
            <div
              className={cn(
                "text-2xl font-bold",
                getGradeColor(student.averageScore)
              )}
            >
              {`${student.averageScore.toFixed(1)} / 10`}
            </div>
          </div>

          {/* Submitted Count */}
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {student.submittedCount}/{student.totalAssignments}
            </div>
          </div>

          {/* Graded Count */}
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {student.gradedCount}/{student.submittedCount}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};