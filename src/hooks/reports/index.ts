/**
 * React Query hooks for reports
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import type { LostReasonType } from "@/lib/validations/relance";

// Types
export interface LostReportSummary {
  count: number;
  totalAmount: number;
}

export interface LostReasonBreakdown {
  reason: LostReasonType;
  count: number;
  amount: number;
}

export interface LostDevisItem {
  id: string;
  devisNumber: string;
  client: {
    id: string;
    fullName: string;
  };
  vehicle: {
    id: string;
    fullName: string;
  };
  estimateur: {
    id: string;
    fullName: string;
  };
  totalTTC: number;
  lostReason: LostReasonType | null;
  lostReasonLabel: string | null;
  lostNotes: string | null;
  lostAt: string | null;
  createdAt: string;
}

export interface LostReportData {
  period: {
    start: string;
    end: string;
    label: string;
  };
  summary: LostReportSummary;
  byReason: LostReasonBreakdown[];
  devis: LostDevisItem[];
}

interface LostReportParams {
  period?: "month" | "quarter" | "year";
  startDate?: string;
  endDate?: string;
}

// Query keys
export const reportKeys = {
  all: ["reports"] as const,
  lost: (params: LostReportParams) => [...reportKeys.all, "lost", params] as const,
};

// API function
async function fetchLostReport(params: LostReportParams = {}): Promise<LostReportData> {
  const searchParams = new URLSearchParams();
  if (params.period) searchParams.set("period", params.period);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);

  const response = await fetch(`/api/v1/reports/lost?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération du rapport");
  }
  return response.json();
}

// Hook
export function useLostReport(params: LostReportParams = {}) {
  return useQuery({
    queryKey: reportKeys.lost(params),
    queryFn: () => fetchLostReport(params),
    staleTime: 60_000, // 1 minute
  });
}
