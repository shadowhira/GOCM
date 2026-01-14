"use client";

import React from "react";
import { useUIStore } from "@/store/ui/useUIStore";
import { cn } from "@/lib/utils";
import { ClassSidebar } from "@/components/features/layout/sidebar";
import { SubmissionDetail } from "@/components/features/class/modules/ClassAssignments/AssignmentDetail/SubmissionDetail";

interface SubmissionDetailPageProps {
  classId: string;
  assignmentId: number;
  submissionId: number;
}

export function SubmissionDetailPage({
  classId,
  assignmentId,
  submissionId,
}: SubmissionDetailPageProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <ClassSidebar classId={classId} />
      </div>

      {/* Mobile: Overlay sidebar when needed */}
      <div className="md:hidden">
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
            <ClassSidebar classId={classId} />
          </>
        )}
      </div>

      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          "pt-14 sm:pt-16 bg-background", // pt-14 sm:pt-16 for header height
          // Desktop margins based on sidebar state
          "md:ml-16", // Default collapsed margin
          sidebarOpen && "md:ml-64", // Expanded margin when toggled
          // Mobile: full width always
          "ml-0"
        )}
      >
        <div className="p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <SubmissionDetail
              assignmentId={assignmentId}
              submissionId={submissionId}
              classId={parseInt(classId)}
            />
          </div>
        </div>
      </main>
    </>
  );
}