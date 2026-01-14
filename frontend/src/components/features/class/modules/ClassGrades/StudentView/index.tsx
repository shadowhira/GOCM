"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Components
import { AssignmentGrades } from "./AssignmentGrades";

interface StudentViewProps {
  classId: string;
}

export const StudentView = ({ classId }: StudentViewProps) => {
  const t = useTranslations();
  const numericClassId = Number(classId);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [highlightAssignmentId, setHighlightAssignmentId] = useState<number | null>(null);

  // Check for highlightAssignment query param from notification click
  useEffect(() => {
    const highlightParam = searchParams.get("highlightAssignment");
    if (highlightParam) {
      const assignmentId = parseInt(highlightParam);
      if (!isNaN(assignmentId)) {
        setHighlightAssignmentId(assignmentId);
        // Remove the query param from URL after processing
        const params = new URLSearchParams(searchParams.toString());
        params.delete("highlightAssignment");
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl, { scroll: false });
        
        // Clear highlight after 5 seconds
        setTimeout(() => {
          setHighlightAssignmentId(null);
        }, 5000);
      }
    }
  }, [searchParams, pathname, router]);


  return (
    <div className="space-y-6">
      {/* Back Button */}
      {/* <BackButton href={`/${locale}/class/${classId}`} /> */}
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
          {t("sidebar_grades")}
        </h1>
      </div>

      <AssignmentGrades classId={numericClassId} highlightAssignmentId={highlightAssignmentId} />
    </div>
  );
};