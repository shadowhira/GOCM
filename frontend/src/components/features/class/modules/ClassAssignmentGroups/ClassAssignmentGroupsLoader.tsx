"use client";

import dynamic from "next/dynamic";

function ClassAssignmentGroupsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const ClassAssignmentGroups = dynamic(
  () => import("./index").then((mod) => ({ default: mod.ClassAssignmentGroups })),
  {
    ssr: false,
    loading: () => <ClassAssignmentGroupsLoading />,
  }
);

interface ClassAssignmentGroupsLoaderProps {
  classId: string;
  pageSize?: number;
  initialPage?: number;
  initialSearch?: string;
  isTeacher?: boolean;
}

export default function ClassAssignmentGroupsLoader({
  classId,
  pageSize,
  initialPage,
  initialSearch,
  isTeacher,
}: ClassAssignmentGroupsLoaderProps) {
  return (
    <ClassAssignmentGroups
      classId={classId}
      pageSize={pageSize}
      initialPage={initialPage}
      initialSearch={initialSearch}
      isTeacher={isTeacher}
    />
  );
}
