/**
 * Dashboard Page
 * Main dashboard with KPIs, charts, and activity tables
 */

"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusCounter, StatusCounterGrid } from "@/components/dashboard/status-counter";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { SalesTable } from "@/components/dashboard/sales-table";
import { ProductionTable } from "@/components/dashboard/production-table";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { useDashboardStats, useMyKpis } from "@/components/dashboard/hooks";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
  XCircle,
  Wrench,
  Package,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

// Status configuration for display
const statusConfig = {
  BROUILLON: { label: "Brouillons", icon: FileText },
  ENVOYE: { label: "Envoyés", icon: Send },
  EN_NEGOCIATION: { label: "En négociation", icon: MessageSquare },
  ACCEPTE: { label: "Acceptés", icon: CheckCircle },
  REFUSE: { label: "Refusés", icon: XCircle },
  EN_REPARATION: { label: "En réparation", icon: Wrench },
  TERMINE: { label: "Terminés", icon: Package },
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: myKpis, isLoading: kpisLoading } = useMyKpis();
  const queryClient = useQueryClient();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Vue d&apos;ensemble de votre activité
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ventes du jour"
          value={stats ? formatCurrency(stats.today.amount) : "$0"}
          icon={<DollarSign className="h-5 w-5" />}
          trend={stats?.today.trend}
          trendLabel="vs hier"
          loading={statsLoading}
        />
        <KpiCard
          title="Devis ce mois"
          value={myKpis?.created.month ?? 0}
          icon={<FileText className="h-5 w-5" />}
          description={`${myKpis?.created.week ?? 0} cette semaine`}
          loading={kpisLoading}
        />
        <KpiCard
          title="Taux de conversion"
          value={`${stats?.conversionRate ?? 0}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Devis acceptés / total"
          loading={statsLoading}
        />
        <KpiCard
          title="CA ce mois"
          value={myKpis ? formatCurrency(myKpis.amount.month) : "$0"}
          icon={<DollarSign className="h-5 w-5" />}
          trend={myKpis?.amount.trend}
          trendLabel="vs mois dernier"
          loading={kpisLoading}
        />
      </div>

      {/* Status Counters */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Par statut</h2>
        <StatusCounterGrid>
          {stats?.statusBreakdown?.map((item) => {
            const config = statusConfig[item.status as keyof typeof statusConfig];
            if (!config) return null;
            const Icon = config.icon;
            return (
              <StatusCounter
                key={item.status}
                status={item.status}
                label={config.label}
                count={item.count}
                icon={<Icon className="h-5 w-5" />}
                href={`/devis?status=${item.status}`}
              />
            );
          })}
        </StatusCounterGrid>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <KpiCard
          title="En production"
          value={stats?.inProgress ?? 0}
          icon={<Wrench className="h-5 w-5" />}
          description="Véhicules en atelier"
          loading={statsLoading}
        />
        <KpiCard
          title="Leads à suivre"
          value={stats?.pendingLeads ?? 0}
          icon={<Clock className="h-5 w-5" />}
          description="Brouillons et envoyés"
          loading={statsLoading}
        />
      </div>

      {/* Trend Chart */}
      <TrendChart />

      {/* Sales Table */}
      <SalesTable />

      {/* Production & Leads Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProductionTable />
        <LeadsTable limit={10} />
      </div>
    </div>
  );
}
