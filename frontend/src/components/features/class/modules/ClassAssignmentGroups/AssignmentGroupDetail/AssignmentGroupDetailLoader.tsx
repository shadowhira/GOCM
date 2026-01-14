"use client";

import dynamic from "next/dynamic";

// Loading component
function AssignmentGroupDetailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Dynamic import - code-split heavy components
const AssignmentGroupDetail = dynamic(
  () => import("./index").then((mod) => ({ default: mod.AssignmentGroupDetail })),
  {
    ssr: false,
    loading: () => <AssignmentGroupDetailLoading />,
  }
);

interface AssignmentGroupDetailLoaderProps {
  classId: number;
  assignmentId: number;
  isTeacher: boolean;
}

export default function AssignmentGroupDetailLoader({
  classId,
  assignmentId,
  isTeacher,
}: AssignmentGroupDetailLoaderProps) {
  return (
    <AssignmentGroupDetail
      classId={classId}
      assignmentId={assignmentId}
      isTeacher={isTeacher}
    />
  );
}
