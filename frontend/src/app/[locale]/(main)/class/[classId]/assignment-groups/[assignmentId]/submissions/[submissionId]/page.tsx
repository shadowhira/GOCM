import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { classApi } from "@/api/classApi";
import { prefetchAssignmentDetail } from "@/queries/assignmentQueries";
import { prefetchSubmissionDetail } from "@/queries/submissionQueries";

import GroupSubmissionDetailLoader from "@/components/features/class/modules/ClassAssignmentGroups/AssignmentGroupDetail/GroupSubmissionDetail/GroupSubmissionDetailLoader";

interface SubmissionDetailPageProps {
  params: Promise<{
    locale: string;
    classId: string;
    assignmentId: string;
    submissionId: string;
  }>;
}

export async function generateMetadata({
  params,
}: SubmissionDetailPageProps): Promise<Metadata> {
  const { classId } = await params;

  try {
    const classData = await classApi.getById(parseInt(classId));
    return {
      title: `Submission Details - ${classData.name}`,
      description: `View detailed submission for ${classData.name}`,
    };
  } catch {
    return {
      title: "Submission Details",
      description: "View detailed submission information",
    };
  }
}

export default async function SubmissionDetailPage({
  params,
}: SubmissionDetailPageProps) {
  const { classId, assignmentId, submissionId } = await params;

  const classIdNum = parseInt(classId);
  const assignmentIdNum = parseInt(assignmentId);
  const submissionIdNum = parseInt(submissionId);

  // Validate params
  if (isNaN(classIdNum) || isNaN(assignmentIdNum) || isNaN(submissionIdNum)) {
    notFound();
  }

  const queryClient = new QueryClient();

  try {
    // Prefetch assignment details
    await prefetchAssignmentDetail(queryClient, assignmentIdNum);

    // Prefetch submission details
    await prefetchSubmissionDetail(queryClient, submissionIdNum);
  } catch (error) {
    console.error("Failed to prefetch submission detail data:", error);
    // Continue to render - component will handle error state
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GroupSubmissionDetailLoader
        classId={classIdNum}
        assignmentId={assignmentIdNum}
        submissionId={submissionIdNum}
      />
    </HydrationBoundary>
  );
}