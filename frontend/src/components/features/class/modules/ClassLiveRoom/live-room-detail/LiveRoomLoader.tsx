"use client";

import dynamic from "next/dynamic";

// Loading component for LiveRoom
function LiveRoomLoading() {
  return (
    // <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    // </div>
  );
}

// Dynamic import of LiveRoomDetail - this will code-split the heavy livekit libraries
const LiveRoomDetail = dynamic(
  () => import("./index"),
  {
    ssr: false, // LiveKit requires client-side only rendering
    loading: () => <LiveRoomLoading />,
  }
);

interface LiveRoomLoaderProps {
  liveRoomId: number;
}

export default function LiveRoomLoader({ liveRoomId }: LiveRoomLoaderProps) {
  return <LiveRoomDetail liveRoomId={liveRoomId} />;
}
