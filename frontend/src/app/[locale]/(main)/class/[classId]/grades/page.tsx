import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { classApi } from "@/api/classApi";
import {
  prefetchClassGradeOverview,
  prefetchStudentAverageGrades,
  prefetchAssignmentGradeSummaries,
  prefetchMyGrades,
} from "@/queries/gradeQueries";
import { ASSIGNMENT_GRADE_PAGINATION } from "@/config/pagination";
import { isTeacherInClass } from "@/lib/auth-server";
import ClassGradesLoader from "@/components/features/class/modules/ClassGrades/ClassGradesLoader";

interface ClassGradesPageProps {
  params: Promise<{
    locale: string;
    classId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ClassGradesPageProps): Promise<Metadata> {
  const { classId } = await params;

  try {
    const classData = await classApi.getById(parseInt(classId));
    return {
      title: `Grades - ${classData.name}`,
      description: `View and manage grades for ${classData.name}. Track student performance and export gradebook.`,
    };
  } catch {
    return {
      title: "Grades",
      description: "Manage student grades and performance tracking",
    };
  }
}

export default async function GradesPage({ params }: ClassGradesPageProps) {
  const { classId } = await params;

  const classIdNum = parseInt(classId);

  // Validate params
  if (isNaN(classIdNum)) {
    notFound();
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Increase stale time for better caching across tabs
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
      },
    },
  });

  // Determine if current user is a teacher in this class
  const isTeacher = await isTeacherInClass(classIdNum);

  try {
    if (isTeacher) {
      // Prefetch all teacher view data in parallel for smooth tab switching
      await Promise.all([
        // Tab 1: Grade Overview
        prefetchClassGradeOverview(queryClient, classIdNum),
        
        // Tab 2: Student Averages
        prefetchStudentAverageGrades(queryClient, classIdNum),
        
        // Tab 3: Assignment Grades (first page)
        prefetchAssignmentGradeSummaries(
          queryClient,
          classIdNum,
          ASSIGNMENT_GRADE_PAGINATION.DEFAULT_PAGE_NUMBER,
          ASSIGNMENT_GRADE_PAGINATION.DEFAULT_PAGE_SIZE
        ),
      ]);

      // Optional: Prefetch second page of assignments for smoother pagination
      // This is non-blocking to avoid delaying initial render
      prefetchAssignmentGradeSummaries(
        queryClient,
        classIdNum,
        2,
        ASSIGNMENT_GRADE_PAGINATION.DEFAULT_PAGE_SIZE
      ).catch(() => {
        // Silently ignore - it's just a prefetch optimization
      });
    } else {
      // Prefetch student view data
      await prefetchMyGrades(queryClient, classIdNum);
    }
  } catch (error) {
    console.error("Failed to prefetch grade data:", error);
    // Continue to render - component will handle error state
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassGradesLoader classId={classId} isTeacher={isTeacher} />
    </HydrationBoundary>
  );
}