"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface AIParametersSectionProps {
  form: UseFormReturn<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  t: (key: string) => string;
}

export function AIParametersSection({ form, t }: AIParametersSectionProps) {
  const difficultyDistribution = form.watch("difficulty_distribution") || { easy: 3, medium: 4, hard: 3 };
  const questionTypeDistribution = form.watch("question_type_distribution") || { single: 5, multiple: 5 };
  const totalQuestions = (difficultyDistribution.easy || 0) + (difficultyDistribution.medium || 0) + (difficultyDistribution.hard || 0);
  const totalTypeQuestions = (questionTypeDistribution.single || 0) + (questionTypeDistribution.multiple || 0);

  const handleDifficultyChange = (level: "easy" | "medium" | "hard", value: string) => {
    // Allow empty string for editing, convert to number only when needed
    const numValue = value === "" ? "" : Math.min(30, Math.max(0, parseInt(value) || 0));
    const newDistribution = { ...difficultyDistribution, [level]: numValue };
    form.setValue("difficulty_distribution", newDistribution, { shouldValidate: true });
    
    // Auto-adjust question type distribution to match total
    const newTotal = (newDistribution.easy || 0) + (newDistribution.medium || 0) + (newDistribution.hard || 0);
    if (newTotal > 0) {
      const currentTypeTotal = (questionTypeDistribution.single || 0) + (questionTypeDistribution.multiple || 0);
      if (currentTypeTotal !== newTotal) {
        // Proportionally adjust
        const singleRatio = (questionTypeDistribution.single || 0) / (currentTypeTotal || 1);
        const newSingle = Math.round(newTotal * singleRatio);
        form.setValue("question_type_distribution", {
          single: newSingle,
          multiple: newTotal - newSingle,
        }, { shouldValidate: true });
      }
    }
  };

  const handleQuestionTypeChange = (type: "single" | "multiple", value: string) => {
    // Allow empty string for editing
    const numValue = value === "" ? "" : Math.min(totalQuestions, Math.max(0, parseInt(value) || 0));
    const otherType = type === "single" ? "multiple" : "single";
    const remaining = totalQuestions - (typeof numValue === "number" ? numValue : 0);
    form.setValue("question_type_distribution", {
      [type]: numValue,
      [otherType]: Math.max(0, remaining),
    }, { shouldValidate: true });
  };

  // Convert empty string to 0 on blur for validation
  const handleBlur = (field: "difficulty_distribution" | "question_type_distribution", subField: string) => {
    const currentValue = form.watch(field);
    if (currentValue && currentValue[subField] === "") {
      form.setValue(field, { ...currentValue, [subField]: 0 }, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* Difficulty Distribution */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("difficulty_distribution")}</Label>
        <p className="text-xs text-muted-foreground">{t("difficulty_distribution_hint")}</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="easy_count" className="text-xs text-success">{t("easy")}</Label>
            <Input
              id="easy_count"
              type="number"
              min={0}
              max={30}
              value={difficultyDistribution.easy}
              onChange={(e) => handleDifficultyChange("easy", e.target.value)}
              onBlur={() => handleBlur("difficulty_distribution", "easy")}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="medium_count" className="text-xs text-warning">{t("medium")}</Label>
            <Input
              id="medium_count"
              type="number"
              min={0}
              max={30}
              value={difficultyDistribution.medium}
              onChange={(e) => handleDifficultyChange("medium", e.target.value)}
              onBlur={() => handleBlur("difficulty_distribution", "medium")}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hard_count" className="text-xs text-destructive">{t("hard")}</Label>
            <Input
              id="hard_count"
              type="number"
              min={0}
              max={30}
              value={difficultyDistribution.hard}
              onChange={(e) => handleDifficultyChange("hard", e.target.value)}
              onBlur={() => handleBlur("difficulty_distribution", "hard")}
              className="h-9"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("total")}: {totalQuestions} {t("questions_lower")}
        </p>
      </div>

      {/* Question Type Distribution */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("question_type_distribution")}</Label>
        <p className="text-xs text-muted-foreground">{t("question_type_distribution_hint")}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="single_count" className="text-xs">{t("single_choice")}</Label>
            <Input
              id="single_count"
              type="number"
              min={0}
              max={totalQuestions}
              value={questionTypeDistribution.single}
              onChange={(e) => handleQuestionTypeChange("single", e.target.value)}
              onBlur={() => handleBlur("question_type_distribution", "single")}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="multiple_count" className="text-xs">{t("multiple_choice")}</Label>
            <Input
              id="multiple_count"
              type="number"
              min={0}
              max={totalQuestions}
              value={questionTypeDistribution.multiple}
              onChange={(e) => handleQuestionTypeChange("multiple", e.target.value)}
              onBlur={() => handleBlur("question_type_distribution", "multiple")}
              className="h-9"
            />
          </div>
        </div>
        {totalTypeQuestions !== totalQuestions && totalQuestions > 0 && (
          <p className="text-xs text-destructive">
            {t("question_type_must_equal_total")} ({totalTypeQuestions}/{totalQuestions})
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">{t("language")}</Label>
          <Select
            value={form.watch("language")}
            onValueChange={(val) => form.setValue("language", val)}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder={t("select_language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Total Points */}
        <div className="space-y-2">
          <Label htmlFor="total_points">{t("total_points")}</Label>
          <Input
            id="total_points"
            type="number"
            min={1}
            {...form.register("total_points", { valueAsNumber: true })}
            placeholder="10"
          />
        </div>

        {/* Point Strategy */}
        <div className="space-y-2">
          <Label htmlFor="point_strategy">{t("point_strategy")}</Label>
          <Select
            value={form.watch("point_strategy")}
            onValueChange={(val) => form.setValue("point_strategy", val)}
          >
            <SelectTrigger id="point_strategy">
              <SelectValue placeholder={t("select_point_strategy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equal">{t("point_strategy_equal")}</SelectItem>
              <SelectItem value="difficulty_weighted">{t("point_strategy_weighted")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
