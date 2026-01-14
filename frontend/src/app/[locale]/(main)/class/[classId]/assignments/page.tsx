import { Metadata } from "next";
import { classApi } from "@/api/classApi";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { prefetchAssignmentsByClassIdPaginated } from "@/queries/assignmentQueries";
import { ASSIGNMENT_PAGINATION } from "@/config/pagination";
import { GetPaginatedAssignmentsRequest } from "@/types/assignment";
import { AssignmentType } from "@/types/constants";
import { isTeacherInClass } from "@/lib/auth-server";
import ClassAssignmentsLoader from "@/components/features/class/modules/ClassAssignments/ClassAssignmentsLoader";

interface ClassAssignmentsPageProps {
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
}: ClassAssignmentsPageProps): Promise<Metadata> {
  const { classId } = await params;

  try {
    const classData = await classApi.getById(parseInt(classId));
    return {
      title: `Assignments - ${classData.name}`,
      description: `Manage assignments for ${classData.name}. Create, view, and grade student assignments.`,
    };
  } catch {
    return {
      title: "Assignments",
      description: "Manage class assignments and submissions",
    };
  }
}

export default async function AssignmentsPage({
  params,
  searchParams,
}: ClassAssignmentsPageProps) {
  const { classId } = await params;
  const classIdNum = parseInt(classId);

  const { page } = await searchParams;

  // Parse search parameters with defaults
  // NOTE: pageSize is fixed to ensure SSR/Client cache synchronization
  const pageOfAssignment = parseInt(page || "1", 10);

  // Validate page number
  const currentPage = Math.max(
    1,
    isNaN(pageOfAssignment) ? 1 : pageOfAssignment
  );

  const pageSize = ASSIGNMENT_PAGINATION.DEFAULT_PAGE_SIZE;

  const queryClient = new QueryClient();

  // Prefetch with fixed pageSize for SSR consistency
  // Exclude Group assignments - they are shown in assignment-groups page
  const initialParams: GetPaginatedAssignmentsRequest = {
    pageNumber: currentPage,
    pageSize: pageSize,
    excludeType: AssignmentType.Group,
  };
  await prefetchAssignmentsByClassIdPaginated(
    queryClient,
    classIdNum,
    initialParams
  );

  // Determine if current user is a teacher in this class
  const isTeacher = await isTeacherInClass(classIdNum);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassAssignmentsLoader
        classId={classId}
        initialPage={currentPage}
        pageSize={pageSize}
        isTeacher={isTeacher}
      />
    </HydrationBoundary>
  );
}
