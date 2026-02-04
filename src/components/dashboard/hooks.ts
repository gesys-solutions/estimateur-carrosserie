/**
 * Dashboard API Hooks
 * TanStack Query hooks for dashboard data
 */

"use client";

import { useQuery } from "@tanstack/react-query";

// Types for dashboard data
export interface DashboardStats {
  today: {
    count: number;
    amount: number;
    trend: number;
  };
  week: {
    count: number;
    amount: number;
  };
  month: {
    count: number;
    amount: number;
  };
  conversionRate: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  inProgress: number;
  pendingLeads: number;
}

export interface Sale {
  id: string;
  devisNumber: string;
  client: {
    id: string;
    name: string;
  };
  vehicle: {
    id: string;
    description: string;
    licensePlate: string | null;
  };
  estimateur: {
    id: string;
    name: string;
  };
  amount: number;
  acceptedAt: string;
}

export interface SalesResponse {
  sales: Sale[];
  count: number;
  totalAmount: number;
}

export interface TrendData {
  date: string;
  label: string;
  amount: number;
  count: number;
}

export interface TrendsResponse {
  data: TrendData[];
  summary: {
    totalAmount: number;
    totalCount: number;
    avgPerDay: number;
    days: number;
  };
}

export interface MyKpis {
  created: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  accepted: {
    month: number;
    total: number;
  };
  amount: {
    month: number;
    lastMonth: number;
    trend: number;
  };
  conversionRate: number;
}

export interface ProductionItem {
  id: string;
  devisNumber: string;
  client: {
    id: string;
    name: string;
    phone: string;
  };
  vehicle: {
    id: string;
    description: string;
    licensePlate: string | null;
  };
  estimateur: {
    id: string;
    name: string;
  };
  amount: number;
  startedAt: string;
  daysInShop: number;
  isOverdue: boolean;
}

export interface ProductionResponse {
  items: ProductionItem[];
  count: number;
  overdueCount: number;
}

export interface LeadItem {
  id: string;
  devisNumber: string;
  status: string;
  client: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  vehicle: {
    id: string;
    description: string;
  };
  estimateur: {
    id: string;
    name: string;
  };
  amount: number;
  createdAt: string;
  daysSinceCreation: number;
  lastRelance: {
    type: string;
    date: string;
    nextFollowUp: string | null;
  } | null;
  needsFollowUp: boolean;
  priority: "high" | "medium" | "low";
}

export interface LeadsResponse {
  items: LeadItem[];
  count: number;
  needsFollowUpCount: number;
  byStatus: {
    brouillon: number;
    envoye: number;
  };
}

// Fetcher function
async function fetchDashboard<T>(endpoint: string): Promise<T> {
  const response = await fetch(`/api/v1/dashboard/${endpoint}`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
}

// Hooks
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => fetchDashboard<DashboardStats>("stats"),
    refetchInterval: 60000, // Refresh every 60 seconds
  });
}

export function useDashboardSales() {
  return useQuery<SalesResponse>({
    queryKey: ["dashboard", "sales"],
    queryFn: () => fetchDashboard<SalesResponse>("sales"),
    refetchInterval: 60000,
  });
}

export function useDashboardTrends(days: number = 7) {
  return useQuery<TrendsResponse>({
    queryKey: ["dashboard", "trends", days],
    queryFn: () => fetchDashboard<TrendsResponse>(`trends?days=${days}`),
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

export function useMyKpis() {
  return useQuery<MyKpis>({
    queryKey: ["dashboard", "my-kpis"],
    queryFn: () => fetchDashboard<MyKpis>("my-kpis"),
    refetchInterval: 60000,
  });
}

export function useDashboardProduction() {
  return useQuery<ProductionResponse>({
    queryKey: ["dashboard", "production"],
    queryFn: () => fetchDashboard<ProductionResponse>("production"),
    refetchInterval: 60000,
  });
}

export function useDashboardLeads() {
  return useQuery<LeadsResponse>({
    queryKey: ["dashboard", "leads"],
    queryFn: () => fetchDashboard<LeadsResponse>("leads"),
    refetchInterval: 60000,
  });
}
