import { Card } from "@/components/ui/card";

interface SubmissionStats {
  total: number;
  submitted: number;
  graded: number;
  notSubmitted: number;
}

interface StatisticsCardsProps {
  stats: SubmissionStats;
  t: (key: string) => string;
}

export function StatisticsCards({ stats, t }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 text-center border-0 shadow-sm bg-muted">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {stats.total}
          </div>
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide opacity-80">
            {t("total")}
          </div>
        </div>
      </Card>

      <Card className="p-4 text-center border-0 shadow-sm bg-primary-soft">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-primary-600">
            {stats.submitted}
          </div>
          <div className="text-sm font-medium text-primary-600 uppercase tracking-wide opacity-80">
            {t("submitted")}
          </div>
        </div>
      </Card>

      <Card className="p-4 text-center border-0 shadow-sm bg-destructive/10">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-destructive">
            {stats.notSubmitted}
          </div>
          <div className="text-sm font-medium text-destructive/70 uppercase tracking-wide">
            {t("not_submitted")}
          </div>
        </div>
      </Card>

      <Card className="p-4 text-center border-0 shadow-sm bg-success-soft">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-success-600">{stats.graded}</div>
          <div className="text-sm font-medium text-success-600 uppercase tracking-wide opacity-80">
            {t("graded")}
          </div>
        </div>
      </Card>
    </div>
  );
}

export type { SubmissionStats };
