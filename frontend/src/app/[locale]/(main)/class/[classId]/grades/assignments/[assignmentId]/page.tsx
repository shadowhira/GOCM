import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { classApi } from "@/api/classApi";
import { prefetchAssignmentGradeDetails } from "@/queries/gradeQueries";
import AssignmentGradeDetailLoader from "@/components/features/class/modules/ClassGrades/TeacherView/AssignmentGradeDetail/AssignmentGradeDetailLoader";

interface PageProps {
  params: Promise<{
    locale: string;
    classId: string;
    assignmentId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { classId } = await params;

  try {
    const classData = await classApi.getById(parseInt(classId));
    return {
      title: `Assignment Grades - ${classData.name}`,
      description: `View detailed grades for assignment in ${classData.name}`,
    };
  } catch {
    return {
      title: "Assignment Grades",
      description: "View detailed grades for assignment",
    };
  }
}

export default async function AssignmentGradeDetailPage({ params }: PageProps) {
  const { classId, assignmentId } = await params;

  const classIdNum = parseInt(classId, 10);
  const assignmentIdNum = parseInt(assignmentId, 10);

  // Validate params
  if (isNaN(classIdNum) || isNaN(assignmentIdNum)) {
    notFound();
  }

  const queryClient = new QueryClient();

  try {
    // Prefetch assignment grade details for SSR
    await prefetchAssignmentGradeDetails(
      queryClient,
      classIdNum,
      assignmentIdNum
    );
  } catch (error) {
    console.error("Failed to prefetch assignment grade details:", error);
    // Continue to render - component will handle error state
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssignmentGradeDetailLoader
        classId={classIdNum}
        assignmentId={assignmentIdNum}
      />
    </HydrationBoundary>
  );
}