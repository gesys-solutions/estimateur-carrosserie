/**
 * Sales Trend Chart
 * Line/Area chart showing revenue over time
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useDashboardTrends } from "./hooks";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TrendChartProps {
  className?: string;
}

export function TrendChart({ className }: TrendChartProps) {
  const [days, setDays] = useState(7);
  const { data, isLoading, error } = useDashboardTrends(days);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-zinc-400">Chargement...</div>
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-red-500">Erreur de chargement</div>
        </div>
      );
    }

    if (data.data.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-zinc-400">Aucune donnée disponible</div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-zinc-500"
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={80}
            className="text-zinc-500"
          />
          <Tooltip
            formatter={(value) => [formatCurrency(value as number), "Montant"]}
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tendance des ventes</CardTitle>
          <CardDescription>
            {data?.summary && (
              <>
                Total: {formatCurrency(data.summary.totalAmount)} ({data.summary.totalCount} devis)
              </>
            )}
          </CardDescription>
        </div>
        <div className="flex gap-1">
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                "px-3 py-1 text-sm rounded-md transition-colors",
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              )}
            >
              {d}j
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
