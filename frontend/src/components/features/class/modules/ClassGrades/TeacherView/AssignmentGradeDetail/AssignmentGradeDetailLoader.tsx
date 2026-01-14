"use client";

import dynamic from "next/dynamic";

function AssignmentGradeDetailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const AssignmentGradeDetail = dynamic(
  () => import("./index").then((mod) => ({ default: mod.AssignmentGradeDetail })),
  {
    ssr: false,
    loading: () => <AssignmentGradeDetailLoading />,
  }
);

interface AssignmentGradeDetailLoaderProps {
  classId: number;
  assignmentId: number;
}

export default function AssignmentGradeDetailLoader({
  classId,
  assignmentId,
}: AssignmentGradeDetailLoaderProps) {
  return <AssignmentGradeDetail classId={classId} assignmentId={assignmentId} />;
}
