import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const GradeOverviewLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-muted rounded w-20"></div>
            <div className="h-4 w-4 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted rounded w-16 mb-2"></div>
            <div className="h-3 bg-muted rounded w-32"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};