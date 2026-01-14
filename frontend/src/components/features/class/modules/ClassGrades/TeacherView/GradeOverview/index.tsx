"use client";

import React from "react";
import { useGetClassGradeOverview } from "@/queries/gradeQueries";
import { GradeOverviewHeader } from "./GradeOverviewHeader";
import { StatisticsCards } from "./StatisticsCards";
import { ScoreRangeCard } from "./ScoreRangeCard";
import { GradeOverviewLoadingSkeleton } from "./GradeOverviewLoadingSkeleton";
import { GradeOverviewErrorState } from "./GradeOverviewErrorState";

interface GradeOverviewProps {
  classId: number;
}

export const GradeOverview = ({ classId }: GradeOverviewProps) => {
  const {
    data: overview,
    isLoading,
    error,
  } = useGetClassGradeOverview(classId);

  // Loading state
  if (isLoading) {
    return <GradeOverviewLoadingSkeleton />;
  }

  // Error state
  if (error || !overview) {
    return <GradeOverviewErrorState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <GradeOverviewHeader className={overview.className} />

      {/* Statistics Cards */}
      <StatisticsCards
        totalStudents={overview.totalStudents}
        totalAssignments={overview.totalAssignments}
        averageClassScore={overview.averageClassScore}
        averageClassPercentage={overview.averageClassPercentage}
        gradingProgress={overview.gradingProgress}
      />

      {/* Score Range */}
      <ScoreRangeCard
        highestScore={overview.highestScore}
        lowestScore={overview.lowestScore}
      />
    </div>
  );
};