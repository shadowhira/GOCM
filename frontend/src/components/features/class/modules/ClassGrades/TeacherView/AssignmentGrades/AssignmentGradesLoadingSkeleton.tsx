import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const AssignmentGradesLoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-muted rounded animate-pulse"></div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="pt-6">
            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-8 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};