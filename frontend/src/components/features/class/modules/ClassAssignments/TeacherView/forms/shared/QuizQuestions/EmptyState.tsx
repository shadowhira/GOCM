"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle } from "lucide-react";

interface EmptyStateProps {
  onAddQuestion: () => void;
}

export function EmptyState({ onAddQuestion }: EmptyStateProps) {
  const t = useTranslations();

  return (
    <div className="text-center py-8">
      <HelpCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-muted-foreground mb-4">{t("no_questions_yet")}</p>
      <Button type="button" onClick={onAddQuestion}>
        <Plus className="h-4 w-4 mr-2" />
        {t("add_first_question")}
      </Button>
    </div>
  );
}
