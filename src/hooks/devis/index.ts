/**
 * React Query hooks for devis management
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { 
  DevisFormData, 
  DevisUpdateFormData, 
  DevisItemFormData,
  DevisSearchParams,
  DevisStatusType 
} from "@/lib/validations/devis";

// Types
export interface DevisListItem {
  id: string;
  devisNumber: string;
  status: DevisStatusType;
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
  totalHT: number;
  totalTPS: number;
  totalTVQ: number;
  totalTTC: number;
  itemCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DevisItem {
  id: string;
  description: string;
  type: 'PIECE' | 'MAIN_OEUVRE' | 'PEINTURE' | 'AUTRE';
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
}

export interface DevisDetail extends Omit<DevisListItem, 'client' | 'vehicle'> {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string | null;
    phone: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    vin: string | null;
    licensePlate: string | null;
    color: string | null;
    fullName: string;
  };
  items: DevisItem[];
  itemsByType: Record<string, DevisItem[]>;
  subtotalsByType: Record<string, number>;
  totals: {
    subtotal: number;
    tps: number;
    tvq: number;
    total: number;
  };
  reclamation: {
    id: string;
    claimNumber: string | null;
    agreedPrice: number | null;
    status: string;
    assurance: {
      id: string;
      name: string;
      contactName: string | null;
      contactPhone: string | null;
    };
  } | null;
  relances: Array<{
    id: string;
    type: string;
    notes: string;
    outcome: string | null;
    nextFollowUp: string | null;
    createdBy: string;
    createdAt: string;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface DevisListResponse {
  data: DevisListItem[];
  pagination: PaginationInfo;
}

interface DevisParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: DevisStatusType;
  clientId?: string;
  sortBy?: string;
  sortOrder?: string;
}

// Query keys
export const devisKeys = {
  all: ["devis"] as const,
  lists: () => [...devisKeys.all, "list"] as const,
  list: (params: DevisParams) => [...devisKeys.lists(), params] as const,
  details: () => [...devisKeys.all, "detail"] as const,
  detail: (id: string) => [...devisKeys.details(), id] as const,
  items: (id: string) => [...devisKeys.all, "items", id] as const,
};

// API functions
async function fetchDevisList(params: DevisParams = {}): Promise<DevisListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.q) searchParams.set("q", params.q);
  if (params.status) searchParams.set("status", params.status);
  if (params.clientId) searchParams.set("clientId", params.clientId);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(`/api/v1/devis?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des devis");
  }
  return response.json();
}

async function fetchDevis(id: string): Promise<{ data: DevisDetail }> {
  const response = await fetch(`/api/v1/devis/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Devis non trouvé");
  }
  return response.json();
}

async function createDevis(data: DevisFormData): Promise<{ data: DevisListItem }> {
  const response = await fetch("/api/v1/devis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création du devis");
  }
  return response.json();
}

async function updateDevis({ id, data }: { id: string; data: DevisUpdateFormData }): Promise<{ data: DevisListItem }> {
  const response = await fetch(`/api/v1/devis/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la mise à jour du devis");
  }
  return response.json();
}

async function deleteDevis(id: string): Promise<void> {
  const response = await fetch(`/api/v1/devis/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression du devis");
  }
}

// Item API functions
async function addDevisItem({ devisId, data }: { devisId: string; data: DevisItemFormData }): Promise<{ data: DevisItem; totals: { subtotal: number; tps: number; tvq: number; total: number } }> {
  const response = await fetch(`/api/v1/devis/${devisId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'ajout de l'item");
  }
  return response.json();
}

async function updateDevisItem({ devisId, itemId, data }: { devisId: string; itemId: string; data: Partial<DevisItemFormData> }): Promise<{ data: DevisItem; totals: { subtotal: number; tps: number; tvq: number; total: number } }> {
  const response = await fetch(`/api/v1/devis/${devisId}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la mise à jour de l'item");
  }
  return response.json();
}

async function deleteDevisItem({ devisId, itemId }: { devisId: string; itemId: string }): Promise<void> {
  const response = await fetch(`/api/v1/devis/${devisId}/items/${itemId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression de l'item");
  }
}

// Status API functions
async function sendDevis(id: string): Promise<{ data: DevisListItem }> {
  const response = await fetch(`/api/v1/devis/${id}/send`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'envoi du devis");
  }
  return response.json();
}

async function changeDevisStatus({ id, status, notes }: { id: string; status: DevisStatusType; notes?: string }): Promise<{ data: DevisListItem; previousStatus: DevisStatusType }> {
  const response = await fetch(`/api/v1/devis/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors du changement de statut");
  }
  return response.json();
}

// Hooks
export function useDevisList(params: DevisParams = {}) {
  return useQuery({
    queryKey: devisKeys.list(params),
    queryFn: () => fetchDevisList(params),
    staleTime: 30_000, // 30 seconds
  });
}

export function useDevis(id: string) {
  return useQuery({
    queryKey: devisKeys.detail(id),
    queryFn: () => fetchDevis(id),
    enabled: !!id,
  });
}

export function useCreateDevis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDevis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: devisKeys.lists() });
    },
  });
}

export function useUpdateDevis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateDevis,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: devisKeys.lists() });
      queryClient.invalidateQueries({ queryKey: devisKeys.detail(variables.id) });
    },
  });
}

export function useDeleteDevis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDevis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: devisKeys.lists() });
    },
  });
}

// Item hooks
export function useAddDevisItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addDevisItem,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: devisKeys.detail(variables.devisId) });
      queryClient.invalidateQueries({ queryKey: devisKeys.lists() });
    },
  });
}

export function useUpdateDevisItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateDevisItem,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: devisKeys.detail(variables.devisId) });
      queryClient.invalidateQueries({ queryKey: devisKeys.lists() });
    },
  });
}

export function useDeleteDevisItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDevisItem,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: devisKeys.detail(variables.devisId) });
      queryClient.invalidateQueries({ queryKey: devisKeys.lists() });
    },
  });
}

// Status hooks
export function useSendDevis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendDevis,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: devisKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: devisKeys.lists() });
    },
  });
}

export function useChangeDevisStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: changeDevisStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: devisKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: devisKeys.lists() });
    },
  });
}
