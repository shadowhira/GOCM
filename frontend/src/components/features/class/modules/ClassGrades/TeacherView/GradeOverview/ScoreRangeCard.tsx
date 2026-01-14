import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Award,
} from "lucide-react";

interface ScoreRangeCardProps {
  highestScore: number;
  lowestScore: number;
}

export const ScoreRangeCard = ({
  highestScore,
  lowestScore,
}: ScoreRangeCardProps) => {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          {t("score_range")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t("highest_score")}
              </span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-lg font-bold text-success">
                  {highestScore.toFixed(1)}
                </span>
              </div>
            </div>
            <Progress
              value={(highestScore / 10) * 100}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t("lowest_score")}
              </span>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="text-lg font-bold text-destructive">
                  {lowestScore.toFixed(1)}
                </span>
              </div>
            </div>
            <Progress
              value={(lowestScore / 10) * 100}
              className="h-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};