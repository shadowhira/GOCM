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

interface QuizNavigatorSheetProps {
  totalQuestions: number;
  answeredQuestions: Set<number>;
  currentQuestion?: number;
  onQuestionClick: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
  t: (key: string) => string;
  isTeacher?: boolean;
}

export function QuizNavigatorSheet(props: QuizNavigatorSheetProps) {
  const [open, setOpen] = useState(false);
  const { answeredQuestions, t } = props;

  const handleQuestionClick = (index: number) => {
    props.onQuestionClick(index);
    setOpen(false); // Close sheet after selecting a question
  };

  const answeredCount = answeredQuestions.size;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg lg:hidden z-50"
          variant="default"
        >
          <div className="relative">
            <List className="h-6 w-6" />
            {!props.isTeacher && answeredCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-2xs bg-success text-white"
              >
                {answeredCount}
              </Badge>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="p-0" style={{ maxHeight: "80vh" }}>
        <SheetHeader className="p-4 border-b">
          <SheetTitle>{t("quiz_navigator")}</SheetTitle>
        </SheetHeader>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "70vh" }}>
          <QuizNavigator {...props} onQuestionClick={handleQuestionClick} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
