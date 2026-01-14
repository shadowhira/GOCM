import { ErrorPage } from "@/components/features/error/ErrorPage";

export const metadata = {
  title: "Forbidden",
  description: "You do not have permission to access this page.",
};

export default function ForbiddenPage() {
  return <ErrorPage code="403" />;
}
