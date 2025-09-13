import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface DashboardMetricProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
}

export const DashboardMetric = React.memo(function DashboardMetric({
  title,
  value,
  description,
  icon
}: DashboardMetricProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
});
