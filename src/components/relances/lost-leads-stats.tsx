/**
 * Lost Leads Stats Component
 * Statistics about lost leads by reason
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useLostReport } from "@/hooks";
import {
  TrendingDown,
  DollarSign,
  PieChart,
  AlertCircle,
} from "lucide-react";

const reasonLabels: Record<string, string> = {
  PRICE: "Prix",
  DELAY: "Délais",
  COMPETITOR: "Concurrent",
  NO_RESPONSE: "Pas de réponse",
  OTHER: "Autre",
};

const reasonColors: Record<string, string> = {
  PRICE: "bg-red-500",
  DELAY: "bg-orange-500",
  COMPETITOR: "bg-blue-500",
  NO_RESPONSE: "bg-gray-500",
  OTHER: "bg-purple-500",
};

interface LostLeadsStatsProps {
  period?: string;
}

export function LostLeadsStats({ period = "month" }: LostLeadsStatsProps) {
  const { data, isLoading, error } = useLostReport({ period });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-red-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          Erreur lors du chargement des statistiques
        </CardContent>
      </Card>
    );
  }

  const { summary, byReason } = data;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Devis perdus
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.count}</div>
            <p className="text-xs text-zinc-500 mt-1">
              ce {period === "month" ? "mois" : period === "quarter" ? "trimestre" : "mois"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Montant perdu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat("fr-CA", {
                style: "currency",
                currency: "CAD",
              }).format(summary.totalAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Moyenne par devis
            </CardTitle>
            <PieChart className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.count > 0
                ? new Intl.NumberFormat("fr-CA", {
                    style: "currency",
                    currency: "CAD",
                  }).format(summary.totalAmount / summary.count)
                : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by reason */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Répartition par raison</CardTitle>
        </CardHeader>
        <CardContent>
          {byReason.length === 0 ? (
            <p className="text-center text-zinc-500 py-4">
              Aucun devis perdu sur cette période
            </p>
          ) : (
            <div className="space-y-4">
              {byReason.map((item) => (
                <div key={item.reason} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${reasonColors[item.reason] ?? "bg-gray-400"}`}
                      />
                      <span className="font-medium">
                        {reasonLabels[item.reason] ?? item.reason}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{item.count}</Badge>
                      <span className="text-sm text-zinc-500 w-24 text-right">
                        {new Intl.NumberFormat("fr-CA", {
                          style: "currency",
                          currency: "CAD",
                        }).format(item.amount)}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${reasonColors[item.reason] ?? "bg-gray-400"}`}
                      style={{
                        width: `${summary.count > 0 ? (item.count / summary.count) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
