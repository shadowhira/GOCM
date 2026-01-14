"use client";

import dynamic from "next/dynamic";

// Loading component
function GroupSubmissionDetailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Dynamic import - code-split heavy components
const GroupSubmissionDetail = dynamic(
  () => import("./index"),
  {
    ssr: false,
    loading: () => <GroupSubmissionDetailLoading />,
  }
);

interface GroupSubmissionDetailLoaderProps {
  classId: number;
  assignmentId: number;
  submissionId: number;
}

export default function GroupSubmissionDetailLoader({
  classId,
  assignmentId,
  submissionId,
}: GroupSubmissionDetailLoaderProps) {
  return (
    <GroupSubmissionDetail
      classId={classId}
      assignmentId={assignmentId}
      submissionId={submissionId}
    />
  );
}
