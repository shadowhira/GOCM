import { FileText } from "lucide-react";

interface QuizEmptyStateProps {
  t: (key: string) => string;
}

export function QuizEmptyState({ t }: QuizEmptyStateProps) {
  return (
    <div className="text-center py-8">
      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">{t("no_quiz_questions")}</p>
    </div>
  );
}
