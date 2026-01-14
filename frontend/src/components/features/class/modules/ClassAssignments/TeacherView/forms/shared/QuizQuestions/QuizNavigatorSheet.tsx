"use client";

import { useState } from "react";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { QuizNavigator } from "./QuizNavigator";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface QuizNavigatorSheetProps {
  totalQuestions: number;
  currentQuestion: number;
  onQuestionClick: (index: number) => void;
  onAddQuestion: () => void;
  getQuestionStatus: (index: number) => "complete" | "incomplete" | "error";
}

export function QuizNavigatorSheet({
  totalQuestions,
  currentQuestion,
  onQuestionClick,
  onAddQuestion,
  getQuestionStatus,
}: QuizNavigatorSheetProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const handleQuestionClick = (index: number) => {
    setOpen(false); // Close sheet first
    // Wait for sheet to close before scrolling
    setTimeout(() => {
      onQuestionClick(index);
    }, 300);
  };

  // Count complete questions
  const completeCount = Array.from(
    { length: totalQuestions },
    (_, i) => i
  ).filter((i) => getQuestionStatus(i) === "complete").length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg lg:hidden z-50"
          variant="default"
          type="button"
        >
          <div className="relative">
            <List className="h-6 w-6" />
            {completeCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-2xs bg-success text-white"
              >
                {completeCount}
              </Badge>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-screen p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>{t("quiz_navigator")}</SheetTitle>
        </SheetHeader>
        <div
          className="p-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 8rem)" }}
        >
          <QuizNavigator
            totalQuestions={totalQuestions}
            currentQuestion={currentQuestion}
            onQuestionClick={handleQuestionClick}
            onAddQuestion={onAddQuestion}
            getQuestionStatus={getQuestionStatus}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
