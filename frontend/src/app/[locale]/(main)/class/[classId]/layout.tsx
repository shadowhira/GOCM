import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Header } from "@/components/features/layout/header";
import { classApi } from "@/api/classApi";
import { classKeys } from "@/queries/classQueries";
import { prefetchUnsubmittedCountByUserInClass } from "@/queries/assignmentQueries";
import { ClassLayout } from "@/components/features/class";
import type { ClassResponse } from "@/types/class";

interface ClassLayoutPageProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
    classId: string;
  }>;
}

async function getClassData(classId: string): Promise<ClassResponse | null> {
  try {
    const classData = await classApi.getById(parseInt(classId));
    return classData;
  } catch (error) {
    console.error("Failed to fetch class data:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: Pick<ClassLayoutPageProps, "params">): Promise<Metadata> {
  const { classId } = await params;

  try {
    const classData = await classApi.getById(parseInt(classId));
    return {
      title: `${classData.name}`,
      description: `Overview and details for class: ${classData.name}. ${
        classData.description ||
        "Manage assignments, grades, and class activities."
      }`,
    };
  } catch {
    return {
      title: "Class",
      description: "Class overview and management page",
    };
  }
}

export default async function ClassPageLayout({
  children,
  params,
}: ClassLayoutPageProps) {
  const { classId } = await params;
  const classIdNum = parseInt(classId);

  // Fetch class data server-side
  const classData = await getClassData(classId);

  // If class not found, show 404 page
  if (!classData) {
    notFound();
  }

  // Create QueryClient and prefetch data
  const queryClient = new QueryClient();

  // Prefetch class data for TanStack Query
  await queryClient.prefetchQuery({
    queryKey: classKeys.detail(classIdNum),
    queryFn: () => classApi.getById(classIdNum),
  });

  // Prefetch unsubmitted assignments count for sidebar badge (SSR)
  try {
    await prefetchUnsubmittedCountByUserInClass(queryClient, classIdNum);
  } catch (error) {
    // If count fetch fails, continue rendering (badge will show 0)
    console.error("Failed to prefetch unsubmitted count:", error);
  }

  // Transform API response to match Header component props
  const classInfo = {
    id: classData.id,
    name: classData.name,
    description: classData.description || "",
    joinCode: classData.joinCode,
    memberCount: classData.memberCount,
    coverImageUrl: classData.coverImageUrl || undefined,
    coverColor: classData.coverColor || undefined,
    teacherName: classData.createdByUserName,
    teacherAvatarUrl: classData.createdByUserAvatarUrl || undefined,
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-background">
        <Header mode="class" classInfo={classInfo} />
        <ClassLayout classId={classId}>{children}</ClassLayout>
      </div>
    </HydrationBoundary>
  );
}
