"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  mode?: "create" | "edit";
  isLoading?: boolean;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  hasQuestions?: boolean;
}

export function FormActions({
  mode = "create",
  isLoading = false,
  onCancel,
  submitText,
  cancelText,
  hasQuestions = true,
}: FormActionsProps) {
  const t = useTranslations();

  const defaultSubmitText =
    mode === "create" ? t("create_assignment") : t("update_assignment");

  const isDisabled = isLoading || !hasQuestions;

  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="min-w-24"
        >
          {cancelText || t("cancel")}
        </Button>
      )}
      <Button
        type="submit"
        disabled={isDisabled}
        className="min-w-36 whitespace-nowrap"
        title={!hasQuestions ? t("quiz_must_have_questions") : undefined}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {mode === "create" ? t("creating") : t("updating")}...
          </>
        ) : (
          <>
            {submitText || defaultSubmitText}
          </>
        )}
      </Button>
    </div>
  );
}
