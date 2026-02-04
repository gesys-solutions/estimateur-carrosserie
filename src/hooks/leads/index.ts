/**
 * React Query hooks for leads management
 */

"use client";

import { useQuery } from "@tanstack/react-query";

// Types
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
    licensePlate: string | null;
  };
  estimateur: {
    id: string;
    name: string;
  };
  amount: number;
  createdAt: string;
  daysSinceCreation: number;
  lastRelance: {
    id: string;
    type: string;
    notes: string;
    date: string;
    nextFollowUp: string | null;
  } | null;
  needsFollowUp: boolean;
  priority: "high" | "medium" | "low";
  lostReason: string | null;
  lostAt: string | null;
  lostNotes: string | null;
}

export interface LeadsResponse {
  items: LeadItem[];
  count: number;
  totalCount: number;
  needsFollowUpCount: number;
  byStatus: {
    brouillon: number;
    envoye: number;
    enNegociation: number;
  };
  pagination: {
    page: number;
    limit: number;
    pages: number;
  };
}

interface LeadsParams {
  status?: string;
  priority?: "high" | "medium" | "low";
  estimateurId?: string;
  daysThreshold?: number;
  page?: number;
  limit?: number;
}

// Query keys
export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params: LeadsParams) => [...leadKeys.lists(), params] as const,
  count: () => [...leadKeys.all, "count"] as const,
};

// API function
async function fetchLeads(params: LeadsParams = {}): Promise<LeadsResponse> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set("status", params.status);
  if (params.priority) searchParams.set("priority", params.priority);
  if (params.estimateurId) searchParams.set("estimateurId", params.estimateurId);
  if (params.daysThreshold) searchParams.set("daysThreshold", String(params.daysThreshold));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const response = await fetch(`/api/v1/leads?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des leads");
  }
  return response.json();
}

// Hooks
export function useLeads(params: LeadsParams = {}) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => fetchLeads(params),
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Hook to get leads count for badge display
 */
export function useLeadsCount() {
  const { data } = useQuery({
    queryKey: leadKeys.count(),
    queryFn: () => fetchLeads({ limit: 1 }), // Only fetch count, minimal data
    staleTime: 60_000, // 1 minute
    refetchInterval: 120_000, // Refetch every 2 minutes
  });

  return {
    total: data?.count ?? 0,
    needsFollowUp: data?.needsFollowUpCount ?? 0,
    byStatus: data?.byStatus ?? { brouillon: 0, envoye: 0, enNegociation: 0 },
  };
}
