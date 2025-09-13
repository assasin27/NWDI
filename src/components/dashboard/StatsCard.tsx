import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  isLoading = false,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-24 bg-muted rounded mb-2"></div>
          <div className="h-6 w-16 bg-muted rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 w-full bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-lg bg-primary/10 p-2">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {trend && (
          <p 
            className={cn(
              "text-xs mt-1",
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}
          >
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
