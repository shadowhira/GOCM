"use client";

import dynamic from "next/dynamic";

function ClassLiveRoomLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const ClassLiveRoom = dynamic(
  () => import("./index").then((mod) => ({ default: mod.ClassLiveRoom })),
  {
    ssr: false,
    loading: () => <ClassLiveRoomLoading />,
  }
);

interface ClassLiveRoomLoaderProps {
  classId: string;
}

export default function ClassLiveRoomLoader({ classId }: ClassLiveRoomLoaderProps) {
  return <ClassLiveRoom classId={classId} />;
}
