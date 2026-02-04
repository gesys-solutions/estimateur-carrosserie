/**
 * React Query hooks for reports
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import type { LostReasonType } from "@/lib/validations/relance";
import { LostReasonLabels } from "@/lib/validations/relance";

// Types
export interface LostReportSummary {
  totalLost: number;
  totalAmount: number;
  averageAmount: number;
}

export interface LostReasonBreakdown {
  reason: LostReasonType;
  label: string;
  count: number;
  totalAmount: number;
  percentage: number;
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
  reasonBreakdown: LostReasonBreakdown[];
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

// API response type
interface ApiLostReportResponse {
  period: {
    start: string;
    end: string;
    label: string;
  };
  summary: {
    count: number;
    totalAmount: number;
  };
  byReason: Array<{
    reason: LostReasonType;
    count: number;
    amount: number;
  }>;
  devis: LostDevisItem[];
}

// API function
async function fetchLostReport(params: LostReportParams = {}): Promise<{ data: LostReportData }> {
  const searchParams = new URLSearchParams();
  if (params.period) searchParams.set("period", params.period);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);

  const response = await fetch(`/api/v1/reports/lost?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération du rapport");
  }
  
  const apiData: ApiLostReportResponse = await response.json();
  
  // Transform to expected format
  const totalCount = apiData.summary.count;
  const reasonBreakdown: LostReasonBreakdown[] = apiData.byReason.map((item) => ({
    reason: item.reason,
    label: LostReasonLabels[item.reason] || item.reason,
    count: item.count,
    totalAmount: item.amount,
    percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
  }));

  return {
    data: {
      period: apiData.period,
      summary: {
        totalLost: apiData.summary.count,
        totalAmount: apiData.summary.totalAmount,
        averageAmount: totalCount > 0 ? Math.round(apiData.summary.totalAmount / totalCount) : 0,
      },
      reasonBreakdown,
      devis: apiData.devis,
    },
  };
}

// Hook
export function useLostReport(params: LostReportParams = {}) {
  return useQuery({
    queryKey: reportKeys.lost(params),
    queryFn: () => fetchLostReport(params),
    staleTime: 60_000, // 1 minute
  });
}
