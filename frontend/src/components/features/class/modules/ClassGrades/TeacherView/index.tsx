"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Components
import { GradeOverview } from "./GradeOverview";
import { StudentAverages } from "./StudentAverages";
import { AssignmentGrades } from "./AssignmentGrades";

interface TeacherViewProps {
  classId: string;
}

export const TeacherView = ({ classId }: TeacherViewProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const numericClassId = Number(classId);
  
  // Extract locale from pathname (e.g., /en/class/1/grades -> en)
  const locale = pathname.split('/')[1];

  // Use local state for instant tab switching
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "overview";
  });

  // Sync URL when tab changes (shallow update, no navigation)
  const handleTabChange = useCallback((value: string) => {
    // Update state immediately for instant UI response
    setActiveTab(value);
    
    // Update URL without triggering navigation (shallow)
    const url = `/${locale}/class/${classId}/grades?tab=${value}`;
    window.history.replaceState(null, "", url);
  }, [locale, classId]);

  // Sync state with URL if user navigates back/forward
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") || "overview";
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {/* <BackButton href={`/${locale}/class/${classId}`} /> */}
      
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
          {t("sidebar_grades")}
        </h1>
        <p className="text-muted-foreground">
          {t("grade_management_description")}
        </p>
      </div> */}

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="inline-flex h-auto w-full sm:w-auto flex-wrap">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm">
            {t("overview_tab")}
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm">
            {t("student_averages_tab")}
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm">
            {t("assignment_grades_tab")}
          </TabsTrigger>
        </TabsList>

        {/* Keep all tabs mounted, control visibility with CSS */}
        <div className={cn("space-y-4", activeTab !== "overview" && "hidden")}>
          <GradeOverview classId={numericClassId} />
        </div>

        <div className={cn("space-y-4", activeTab !== "students" && "hidden")}>
          <StudentAverages classId={numericClassId} />
        </div>

        <div className={cn("space-y-4", activeTab !== "assignments" && "hidden")}>
          <AssignmentGrades classId={numericClassId} />
        </div>
      </Tabs>
    </div>
  );
};