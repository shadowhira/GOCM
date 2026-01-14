"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddQuestionButtonProps {
  onAddQuestion: () => void;
}

export function AddQuestionButton({ onAddQuestion }: AddQuestionButtonProps) {
  const t = useTranslations();

  return (
    <div className="pt-4 border-t border-dashed">
      <div className="text-center mb-3">
        <p className="text-xs text-muted-foreground">
          {t("add_more_questions_hint")}
        </p>
      </div>
      <Button
        type="button"
        onClick={onAddQuestion}
        variant="outline"
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("add_question")}
      </Button>
    </div>
  );
}
