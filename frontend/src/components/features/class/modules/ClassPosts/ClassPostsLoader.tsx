"use client";

import dynamic from "next/dynamic";

// Loading component
function ClassPostsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Dynamic import - code-split heavy components like PostList, PostModal, etc.
const ClassPosts = dynamic(
  () => import("./index").then((mod) => ({ default: mod.ClassPosts })),
  {
    ssr: false,
    loading: () => <ClassPostsLoading />,
  }
);

interface ClassPostsLoaderProps {
  classId: string;
}

export default function ClassPostsLoader({ classId }: ClassPostsLoaderProps) {
  return <ClassPosts classId={classId} />;
}
