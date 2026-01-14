"use client";

import dynamic from "next/dynamic";

// Loading component
function AssignmentDetailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Dynamic import - code-split heavy components
const AssignmentDetail = dynamic(
  () => import("./index").then((mod) => ({ default: mod.AssignmentDetail })),
  {
    ssr: false,
    loading: () => <AssignmentDetailLoading />,
  }
);

interface AssignmentDetailLoaderProps {
  classId: number;
  assignmentId: number;
  isTeacher: boolean;
}

export default function AssignmentDetailLoader({
  classId,
  assignmentId,
  isTeacher,
}: AssignmentDetailLoaderProps) {
  return (
    <AssignmentDetail
      classId={classId}
      assignmentId={assignmentId}
      isTeacher={isTeacher}
    />
  );
}
