import { cn, parseBackendDateTime } from "@/lib/utils";

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "—";
  const parsed = parseBackendDateTime(dateString);
  if (!parsed) return "—";
  return parsed.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getScoreColor = (normalizedScore: number | null) => {
  if (normalizedScore === null) return "text-muted-foreground";
  if (normalizedScore >= 8) return cn("text-success font-semibold");
  if (normalizedScore >= 6.5) return cn("text-info font-semibold");
  if (normalizedScore >= 5) return cn("text-warning font-semibold");
  return cn("text-destructive font-semibold");
};
