"use client";

import dynamic from "next/dynamic";

function ClassSettingsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const ClassSettings = dynamic(
  () => import("./index").then((mod) => ({ default: mod.ClassSettings })),
  {
    ssr: false,
    loading: () => <ClassSettingsLoading />,
  }
);

interface ClassSettingsLoaderProps {
  classId: string;
}

export default function ClassSettingsLoader({ classId }: ClassSettingsLoaderProps) {
  return <ClassSettings classId={classId} />;
}
