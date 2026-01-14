"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAllowShowResultToStudent } from "@/queries/assignmentQueries";

interface AllowShowResultToggleProps {
  assignmentId: number;
  allowShowResultToStudent: boolean;
}

export function AllowShowResultToggle({
  assignmentId,
  allowShowResultToStudent,
}: AllowShowResultToggleProps) {
  const t = useTranslations();
  const allowShowResultMutation = useAllowShowResultToStudent();
  const [localValue, setLocalValue] = useState(allowShowResultToStudent);

  useEffect(() => {
    setLocalValue(allowShowResultToStudent);
  }, [allowShowResultToStudent]);

  const handleToggle = async (checked: boolean) => {
    setLocalValue(checked);
    try {
      await allowShowResultMutation.mutateAsync({
        assignmentId,
        data: {
          allowShowResultToStudent: checked,
        },
      });
    } catch {
      setLocalValue(!checked);
      toast.error(t("update_failed"));
    }
  };

  return (
    <div
      className="
        flex items-center justify-between w-full
        rounded-xl border border-border/50 bg-card px-5 py-4
        shadow-sm hover:shadow-md transition-shadow duration-200
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex items-center justify-center p-2 rounded-lg transition-colors duration-200
            ${localValue ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
          `}
        >
          {localValue ? (
            <Eye className="h-4 w-4 transition-transform duration-200 scale-110" />
          ) : (
            <EyeOff className="h-4 w-4 transition-transform duration-200" />
          )}
        </div>

        <Label
          htmlFor="allow-show-result-switch"
          className="text-sm font-medium cursor-pointer select-none"
        >
          {t("allow_students_to_view_results")}
        </Label>
      </div>

      <Switch
        id="allow-show-result-switch"
        checked={localValue}
        onCheckedChange={handleToggle}
        disabled={allowShowResultMutation.isPending}
        className="scale-110"
      />
    </div>
  );
}
