"use client";

import dynamic from "next/dynamic";

interface NotificationsPageLoaderProps {
  initialPage?: number;
  initialPageSize?: number;
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

const NotificationsPageComponent = dynamic(
  () => import("./NotificationsPage").then((mod) => ({ default: mod.NotificationsPage })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export const NotificationsPageLoader = ({ initialPage, initialPageSize }: NotificationsPageLoaderProps) => {
  return <NotificationsPageComponent initialPage={initialPage} initialPageSize={initialPageSize} />;
};
