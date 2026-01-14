"use client";

import dynamic from "next/dynamic";

function ClassMembersLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const ClassMembers = dynamic(
  () => import("./index").then((mod) => ({ default: mod.ClassMembers })),
  {
    ssr: false,
    loading: () => <ClassMembersLoading />,
  }
);

interface ClassMembersLoaderProps {
  classId: string;
}

export default function ClassMembersLoader({ classId }: ClassMembersLoaderProps) {
  return <ClassMembers classId={classId} />;
}
