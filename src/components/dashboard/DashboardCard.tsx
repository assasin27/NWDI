import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface DashboardCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
  };
  isLoading?: boolean;
  loadingSkeleton?: ReactNode;
}

export function DashboardCard({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  action,
  isLoading = false,
  loadingSkeleton,
}: DashboardCardProps) {
  if (isLoading) {
    return loadingSkeleton || (
      <Card className={className}>
        <CardHeader className={cn("pb-2", headerClassName)}>
          <Skeleton className="h-6 w-32 mb-1" />
          {description && <Skeleton className="h-4 w-48" />}
        </CardHeader>
        <CardContent className={contentClassName}>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={cn("pb-2", headerClassName)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          {action && (
            <Button
              variant={action.variant || "outline"}
              size={action.size || "sm"}
              onClick={action.onClick}
              className="shrink-0"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
      {action && (
        <CardFooter className={cn("border-t pt-4 mt-2", footerClassName)}>
          <Button
            variant="link"
            size="sm"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={action.onClick}
          >
            View all {title.toLowerCase()}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Specific card components for common dashboard use cases

export function MetricCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description || trend ? (
          <p className="text-xs text-muted-foreground flex items-center">
            {description}
            {trend && (
              <span
                className={cn(
                  "ml-1 flex items-center",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
