import { Metadata } from "next";
import { classApi } from "@/api/classApi";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { isTeacherInClass } from "@/lib/auth-server";
import { prefetchAssignmentsByClassIdPaginated } from "@/queries/assignmentQueries";
import ClassAssignmentGroupsLoader from "@/components/features/class/modules/ClassAssignmentGroups/ClassAssignmentGroupsLoader";
import { ASSIGNMENT_PAGINATION } from "@/config/pagination";
import { AssignmentType } from "@/types/constants";

interface ClassAssignmentGroupsPageProps {
  params: Promise<{
    locale: string;
    classId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ClassAssignmentGroupsPageProps): Promise<Metadata> {
  const { classId } = await params;

  try {
    const classData = await classApi.getById(parseInt(classId));
    return {
      title: `Group Assignments - ${classData.name}`,
      description: `Manage group assignments for ${classData.name}. Create, view, and manage student group assignments.`,
    };
  } catch {
    return {
      title: "Group Assignments",
      description: "Manage class group assignments and submissions",
    };
  }
}

export default async function AssignmentGroupsPage({
  params,
  searchParams,
}: ClassAssignmentGroupsPageProps) {
  const { classId } = await params;
  const classIdNum = parseInt(classId);

  const { page } = await searchParams;

  // Parse search parameters with defaults
  const pageOfAssignment = parseInt(page || "1", 10);

  // Validate page number
  const currentPage = Math.max(
    1,
    isNaN(pageOfAssignment) ? 1 : pageOfAssignment
  );

  const pageSize = ASSIGNMENT_PAGINATION.DEFAULT_PAGE_SIZE;

  const queryClient = new QueryClient();

  // Prefetch assignments list for SSR - only Group type assignments
  await prefetchAssignmentsByClassIdPaginated(queryClient, classIdNum, {
    pageNumber: currentPage,
    pageSize,
    type: AssignmentType.Group,
  });

  // Determine if current user is a teacher in this class
  const isTeacher = await isTeacherInClass(classIdNum);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassAssignmentGroupsLoader
        classId={classId}
        initialPage={currentPage}
        pageSize={pageSize}
        isTeacher={isTeacher}
      />
    </HydrationBoundary>
  );
}