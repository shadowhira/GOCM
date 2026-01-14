import { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getServerQueryClient } from "@/lib/serverQueryClient";
import { Header } from "@/components/features/layout/header";
import { CalendarLoader } from "@/components/features/calendar/CalendarLoader";
import { calendarApi } from "@/api/calendarApi";
import { calendarKeys } from "@/queries/calendarQueries";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "View your class schedules, assignment deadlines and live room sessions in one place.",
};

export default async function CalendarPage() {
  // SSR with TanStack Query - prefetch calendar events
  const queryClient = getServerQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: calendarKeys.eventsByParams(undefined),
      queryFn: () => calendarApi.getEvents(),
    });
  } catch (error) {
    // Handle server-side fetch errors gracefully
    console.error("Failed to prefetch calendar events:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header in Dashboard mode - no left elements */}
      <Header mode="dashboard" />

      {/* Main content */}
      <main className="pt-14 sm:pt-16">
        <div className="container mx-auto p-4 md:p-6">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <CalendarLoader />
          </HydrationBoundary>
        </div>
      </main>
    </div>
  );
}
