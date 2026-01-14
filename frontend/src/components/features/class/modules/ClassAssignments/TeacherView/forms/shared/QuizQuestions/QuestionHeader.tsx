"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface QuestionHeaderProps {
  questionNumber: number;
  onRemove: () => void;
}

export function QuestionHeader({
  questionNumber,
  onRemove,
}: QuestionHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-between">
      <h4 className="font-medium">
        {t("question")} {questionNumber}
      </h4>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
