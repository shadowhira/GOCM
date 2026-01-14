import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { classApi } from "@/api/classApi";
import { prefetchAssignmentDetail } from "@/queries/assignmentQueries";
import { isTeacherInClass } from "@/lib/auth-server";
import AssignmentGroupDetailLoader from "@/components/features/class/modules/ClassAssignmentGroups/AssignmentGroupDetail/AssignmentGroupDetailLoader";
import { prefetchSafeSubmissionForStudent } from "@/queries/submissionQueries";

interface AssignmentGroupDetailPageProps {
  params: Promise<{
    locale: string;
    classId: string;
    assignmentId: string;
  }>;
}

export async function generateMetadata({
  params,
}: AssignmentGroupDetailPageProps): Promise<Metadata> {
  const { classId } = await params;

  try {
    const classData = await classApi.getById(parseInt(classId));
    return {
      title: `Group Assignment - ${classData.name}`,
      description: `View group assignment details for ${classData.name}`,
    };
  } catch {
    return {
      title: "Group Assignment Details",
      description: "View group assignment details and submissions",
    };
  }
}

export default async function AssignmentGroupDetailPage({
  params,
}: AssignmentGroupDetailPageProps) {
  const { classId, assignmentId } = await params;

  const classIdNum = parseInt(classId);
  const assignmentIdNum = parseInt(assignmentId);

  if (isNaN(classIdNum) || isNaN(assignmentIdNum)) {
    notFound();
  }

  const queryClient = new QueryClient();

  try {
    // Prefetch assignment details
    await prefetchAssignmentDetail(queryClient, assignmentIdNum);
    await prefetchSafeSubmissionForStudent(
          queryClient,
          classIdNum,
          assignmentIdNum
        );

    // Note: Additional prefetch for group-specific data can be added here
  } catch (error) {
    console.error("Failed to prefetch data:", error);
  }

  const isTeacher = await isTeacherInClass(classIdNum);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssignmentGroupDetailLoader
        classId={classIdNum}
        assignmentId={assignmentIdNum}
        isTeacher={isTeacher}
      />
    </HydrationBoundary>
  );
}