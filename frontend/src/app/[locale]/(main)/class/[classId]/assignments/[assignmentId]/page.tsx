import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { classApi } from "@/api/classApi";
import { prefetchAssignmentDetail } from "@/queries/assignmentQueries";
import {
  prefetchSubmissionsByAssignmentAndClass,
  prefetchGradingStatistics,
  prefetchSafeSubmissionForStudent,
} from "@/queries/submissionQueries";
import { isTeacherInClass } from "@/lib/auth-server";
import AssignmentDetailLoader from "@/components/features/class/modules/ClassAssignments/AssignmentDetail/AssignmentDetailLoader";

interface AssignmentDetailPageProps {
  params: Promise<{
    locale: string;
    classId: string;
    assignmentId: string;
  }>;
}

export async function generateMetadata({
  params,
}: AssignmentDetailPageProps): Promise<Metadata> {
  const { classId } = await params;

  try {
    const classData = await classApi.getById(parseInt(classId));
    return {
      title: `Assignment - ${classData.name}`,
      description: `View assignment details for ${classData.name}`,
    };
  } catch {
    return {
      title: "Assignment Details",
      description: "View assignment details and submissions",
    };
  }
}

export default async function AssignmentDetailPage({
  params,
}: AssignmentDetailPageProps) {
  const { classId, assignmentId } = await params;

  const classIdNum = parseInt(classId);
  const assignmentIdNum = parseInt(assignmentId);

  // Validate params
  if (isNaN(classIdNum) || isNaN(assignmentIdNum)) {
    notFound();
  }

  const queryClient = new QueryClient();

  try {
    // Prefetch assignment details
    await prefetchAssignmentDetail(queryClient, assignmentIdNum);

    // Prefetch submissions data for better SSR performance
    await prefetchSubmissionsByAssignmentAndClass(
      queryClient,
      classIdNum,
      assignmentIdNum
    );

    // Prefetch grading statistics for teacher view
    await prefetchGradingStatistics(queryClient, assignmentIdNum);

    // Prefetch student submission data for better student experience
    // Note: This is safe to call even if no submission exists
    await prefetchSafeSubmissionForStudent(
      queryClient,
      classIdNum,
      assignmentIdNum
    );
  } catch (error) {
    console.error("Failed to prefetch data:", error);
    // Continue to render - component will handle error state
  }

  // Determine if current user is a teacher in this class
  const isTeacher = await isTeacherInClass(classIdNum);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssignmentDetailLoader
        classId={classIdNum}
        assignmentId={assignmentIdNum}
        isTeacher={isTeacher}
      />
    </HydrationBoundary>
  );
}
