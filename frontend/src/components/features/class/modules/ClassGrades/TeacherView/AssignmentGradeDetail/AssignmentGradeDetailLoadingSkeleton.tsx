import React from "react";

export const AssignmentGradeDetailLoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="h-10 bg-muted rounded animate-pulse"></div>
      <div className="h-64 bg-muted rounded animate-pulse"></div>
      <div className="h-96 bg-muted rounded animate-pulse"></div>
    </div>
  );
};