/**
 * KPI Card Component
 * Displays a single KPI with optional trend indicator
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  className?: string;
}

export function KpiCard({
  title,
  value,
  description,
  icon,
  trend,
  trendLabel,
  loading = false,
  className,
}: KpiCardProps) {
  const renderTrend = () => {
    if (trend === undefined) return null;
    
    const isPositive = trend > 0;
    const isNeutral = trend === 0;
    
    return (
      <div
        className={cn(
          "flex items-center gap-1 text-xs font-medium",
          isPositive && "text-green-600 dark:text-green-400",
          trend < 0 && "text-red-600 dark:text-red-400",
          isNeutral && "text-zinc-500"
        )}
      >
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {trend < 0 && <TrendingDown className="h-3 w-3" />}
        {isNeutral && <Minus className="h-3 w-3" />}
        <span>
          {isPositive && "+"}
          {trend}%
          {trendLabel && ` ${trendLabel}`}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-700 rounded mb-2" />
          <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {title}
        </CardTitle>
        {icon && <div className="text-zinc-500 dark:text-zinc-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {renderTrend()}
          {description && !trend && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
