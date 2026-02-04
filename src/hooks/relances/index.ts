/**
 * React Query hooks for relances (follow-ups) management
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateRelanceInput,
  UpdateRelanceInput,
  MarkLostInput,
  LostReasonType,
  RelanceTypeType,
} from "@/lib/validations/relance";
import { devisKeys } from "../devis";

// Types
export interface RelanceItem {
  id: string;
  type: RelanceTypeType;
  notes: string;
  outcome: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  nextFollowUp: string | null;
  createdBy: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

export interface DevisToFollow {
  id: string;
  devisNumber: string;
  status: string;
  client: {
    id: string;
    fullName: string;
    phone: string;
  };
  vehicle: {
    id: string;
    fullName: string;
    licensePlate: string | null;
  };
  estimateur: {
    id: string;
    fullName: string;
  };
  totalTTC: number;
  daysSinceAction: number;
  urgency: "low" | "medium" | "high";
  lastAction: string;
  lastRelance: {
    id: string;
    type: RelanceTypeType;
    notes: string;
    outcome: string | null;
    nextFollowUp: string | null;
    createdAt: string;
  } | null;
  createdAt: string;
}

export interface RelancesStats {
  total: number;
  high: number;
  medium: number;
  low: number;
}

interface RelancesListResponse {
  data: DevisToFollow[];
  stats: RelancesStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface RelancesParams {
  daysThreshold?: number;
  estimateurId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Query keys
export const relanceKeys = {
  all: ["relances"] as const,
  lists: () => [...relanceKeys.all, "list"] as const,
  list: (params: RelancesParams) => [...relanceKeys.lists(), params] as const,
  devisRelances: (devisId: string) => [...relanceKeys.all, "devis", devisId] as const,
  stats: () => [...relanceKeys.all, "stats"] as const,
};

// API functions
async function fetchRelancesList(params: RelancesParams = {}): Promise<RelancesListResponse> {
  const searchParams = new URLSearchParams();
  if (params.daysThreshold) searchParams.set("daysThreshold", String(params.daysThreshold));
  if (params.estimateurId) searchParams.set("estimateurId", params.estimateurId);
  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const response = await fetch(`/api/v1/relances?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des relances");
  }
  return response.json();
}

async function fetchDevisRelances(devisId: string): Promise<{ data: RelanceItem[] }> {
  const response = await fetch(`/api/v1/devis/${devisId}/relances`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des relances");
  }
  return response.json();
}

async function createRelance({
  devisId,
  data,
}: {
  devisId: string;
  data: CreateRelanceInput;
}): Promise<{ data: RelanceItem }> {
  const response = await fetch(`/api/v1/devis/${devisId}/relances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création de la relance");
  }
  return response.json();
}

async function updateRelance({
  id,
  data,
}: {
  id: string;
  data: UpdateRelanceInput;
}): Promise<{ data: RelanceItem }> {
  const response = await fetch(`/api/v1/relances/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la mise à jour de la relance");
  }
  return response.json();
}

async function deleteRelance(id: string): Promise<void> {
  const response = await fetch(`/api/v1/relances/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression de la relance");
  }
}

async function markDevisLost({
  devisId,
  data,
}: {
  devisId: string;
  data: MarkLostInput;
}): Promise<{
  data: {
    id: string;
    devisNumber: string;
    status: string;
    lostReason: LostReasonType;
    lostAt: string;
    lostNotes: string | null;
  };
  message: string;
}> {
  const response = await fetch(`/api/v1/devis/${devisId}/mark-lost`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors du marquage du devis");
  }
  return response.json();
}

// Hooks
export function useRelancesList(params: RelancesParams = {}) {
  return useQuery({
    queryKey: relanceKeys.list(params),
    queryFn: () => fetchRelancesList(params),
    staleTime: 30_000, // 30 seconds
  });
}

export function useDevisRelances(devisId: string) {
  return useQuery({
    queryKey: relanceKeys.devisRelances(devisId),
    queryFn: () => fetchDevisRelances(devisId),
    enabled: !!devisId,
  });
}

export function useCreateRelance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRelance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: relanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: relanceKeys.devisRelances(variables.devisId) });
      queryClient.invalidateQueries({ queryKey: devisKeys.detail(variables.devisId) });
    },
  });
}

export function useUpdateRelance(devisId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRelance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: relanceKeys.lists() });
      if (devisId) {
        queryClient.invalidateQueries({ queryKey: relanceKeys.devisRelances(devisId) });
        queryClient.invalidateQueries({ queryKey: devisKeys.detail(devisId) });
      }
    },
  });
}

export function useDeleteRelance(devisId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRelance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: relanceKeys.lists() });
      if (devisId) {
        queryClient.invalidateQueries({ queryKey: relanceKeys.devisRelances(devisId) });
        queryClient.invalidateQueries({ queryKey: devisKeys.detail(devisId) });
      }
    },
  });
}

export function useMarkDevisLost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markDevisLost,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: relanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: devisKeys.detail(variables.devisId) });
      queryClient.invalidateQueries({ queryKey: devisKeys.lists() });
    },
  });
}
