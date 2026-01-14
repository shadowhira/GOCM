import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface QuizSubmitButtonProps {
  answeredCount: number;
  totalCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
  t: (key: string) => string;
}

export function QuizSubmitButton({
  answeredCount,
  totalCount,
  isSubmitting,
  onSubmit,
  t,
}: QuizSubmitButtonProps) {
  return (
    <div className="flex justify-end pt-4">
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || answeredCount === 0}
        className="px-8"
      >
        {isSubmitting ? (
          <>
            <Send className="w-4 h-4 mr-2 animate-pulse" />
            {t("submitting")}...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            {t("submit_quiz")} ({answeredCount}/{totalCount})
          </>
        )}
      </Button>
    </div>
  );
}
