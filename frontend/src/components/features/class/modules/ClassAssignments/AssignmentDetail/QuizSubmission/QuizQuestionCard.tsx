import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { QuizQuestionResponse } from "@/types/quiz";
import { QuestionType } from "@/types/constants";

interface QuizQuestionCardProps {
  question: QuizQuestionResponse;
  index: number;
  selectedOptions: number[];
  onSingleChoiceChange: (optionId: number) => void;
  onMultipleChoiceChange: (optionId: number, checked: boolean) => void;
  canSubmit: boolean;
  t: (key: string) => string;
}

export function QuizQuestionCard({
  question,
  index,
  selectedOptions,
  onSingleChoiceChange,
  onMultipleChoiceChange,
  canSubmit,
  t,
}: QuizQuestionCardProps) {
  const isAnswered = selectedOptions.length > 0;

  return (
    <div className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div className="flex items-start gap-2 sm:gap-3">
        <span
          className={cn(
            "flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full shrink-0",
            isAnswered
              ? "bg-success text-success-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground mb-2 break-words">
            {question.questionText}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <Badge variant="outline" className="text-xs">
              {question.questionType === QuestionType.SingleChoice
                ? t("single_choice")
                : t("multiple_choice")}
            </Badge>
            <Badge variant="secondary" className="text-xs font-semibold">
              {question.point} {t("points_lower")}
            </Badge>
            {question.questionType === QuestionType.MultipleChoice && (
              <span className="text-xs text-muted-foreground">
                {t("select_multiple_answers")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="ml-7 sm:ml-9 space-y-2 sm:space-y-3">
        {question.questionType === QuestionType.SingleChoice ? (
          <RadioGroup
            value={selectedOptions[0]?.toString() || ""}
            onValueChange={(value) => onSingleChoiceChange(parseInt(value))}
            disabled={!canSubmit}
          >
            {question.options.map((option, optionIndex) => {
              const isSelected = selectedOptions.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border-2 transition-all",
                    isSelected
                      ? "bg-blue-500/20 border-blue-500 shadow-md"
                      : "bg-card border-border hover:border-blue-500/50 hover:bg-muted/50",
                    !canSubmit && "opacity-50"
                  )}
                >
                  <RadioGroupItem
                    value={option.id.toString()}
                    id={`q${question.id}-o${option.id}`}
                    className={cn(
                      isSelected && "border-blue-500 text-blue-500"
                    )}
                  />
                  <label
                    htmlFor={`q${question.id}-o${option.id}`}
                    className={cn(
                      "text-sm cursor-pointer flex-1 break-words whitespace-normal",
                      isSelected && "font-semibold text-foreground",
                      !canSubmit && "cursor-not-allowed"
                    )}
                  >
                    <span className="font-mono text-muted-foreground mr-2">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    {option.optionText}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => {
              const isSelected = selectedOptions.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border-2 transition-all",
                    isSelected
                      ? "bg-blue-500/20 border-blue-500 shadow-md"
                      : "bg-card border-border hover:border-blue-500/50 hover:bg-muted/50",
                    !canSubmit && "opacity-50"
                  )}
                >
                  <Checkbox
                    id={`q${question.id}-o${option.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      onMultipleChoiceChange(option.id, checked as boolean)
                    }
                    disabled={!canSubmit}
                    className={cn(isSelected && "border-blue-500")}
                  />
                  <label
                    htmlFor={`q${question.id}-o${option.id}`}
                    className={cn(
                      "text-sm cursor-pointer flex-1 break-words whitespace-normal",
                      isSelected && "font-semibold text-foreground",
                      !canSubmit && "cursor-not-allowed"
                    )}
                  >
                    <span className="font-mono text-muted-foreground mr-2">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    {option.optionText}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
