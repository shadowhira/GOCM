import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  t: (key: string) => string;
}

export function EmptyState({ t }: EmptyStateProps) {
  return (
    <Card className="p-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium text-foreground mb-1">
            {t("no_submissions_found_title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("no_submissions_found")}
          </p>
        </div>
      </div>
    </Card>
  );
}
