"use client";

import dynamic from "next/dynamic";

// Loading component
function SubmissionDetailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Dynamic import - code-split heavy components
const SubmissionDetail = dynamic(
  () => import("./index"),
  {
    ssr: false,
    loading: () => <SubmissionDetailLoading />,
  }
);

interface SubmissionDetailLoaderProps {
  classId: number;
  assignmentId: number;
  submissionId: number;
}

export default function SubmissionDetailLoader({
  classId,
  assignmentId,
  submissionId,
}: SubmissionDetailLoaderProps) {
  return (
    <SubmissionDetail
      classId={classId}
      assignmentId={assignmentId}
      submissionId={submissionId}
    />
  );
}
