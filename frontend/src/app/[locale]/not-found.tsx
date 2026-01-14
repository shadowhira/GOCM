import { ErrorPage } from "@/components/features/error/ErrorPage";

export const metadata = {
  title: "Not Found",
  description: "The requested page was not found.",
};

export default function NotFound() {
  return <ErrorPage code="404" />;
}
