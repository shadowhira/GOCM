"use client";

import dynamic from "next/dynamic";

// Loading component
function CalendarLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Dynamic import - code-split CalendarWidget and its dependencies
const CalendarWidget = dynamic(
  () =>
    import("@/components/features/calendar").then((mod) => ({
      default: mod.CalendarWidget,
    })),
  {
    ssr: false,
    loading: () => <CalendarLoading />,
  }
);

export function CalendarLoader() {
  return <CalendarWidget />;
}
