/**
 * React Query hooks for client management
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ClientFormData, UpdateClientFormData, VehicleFormData } from "@/lib/validations/client";

// Types
export interface ClientListItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string;
  city: string | null;
  vehicleCount: number;
  createdAt: string;
}

export interface ClientDetail extends Omit<ClientListItem, 'vehicleCount'> {
  address: string | null;
  postalCode: string | null;
  updatedAt: string;
  vehicles: VehicleListItem[];
  devis: ClientDevisListItem[];
  stats: {
    total: number;
    totalAmount: number;
    approved: number;
  };
  counts: {
    vehicles: number;
    devis: number;
  };
}

export interface VehicleListItem {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  licensePlate: string | null;
  color: string | null;
  fullName: string;
  devisCount?: number;
  createdAt: string;
}

export interface ClientDevisListItem {
  id: string;
  number: string;
  status: string;
  totalTTC: number;
  vehicle: string | null;
  licensePlate: string | null;
  estimateur: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ClientsResponse {
  data: ClientListItem[];
  pagination: PaginationInfo;
}

interface ClientParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: string;
}

// Query keys
export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (params: ClientParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

export const vehicleKeys = {
  all: ["vehicles"] as const,
  byClient: (clientId: string) => [...vehicleKeys.all, "client", clientId] as const,
  detail: (id: string) => [...vehicleKeys.all, "detail", id] as const,
};

// API functions
async function fetchClients(params: ClientParams = {}): Promise<ClientsResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.q) searchParams.set("q", params.q);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(`/api/v1/clients?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des clients");
  }
  return response.json();
}

async function fetchClient(id: string): Promise<{ data: ClientDetail }> {
  const response = await fetch(`/api/v1/clients/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Client non trouvé");
  }
  return response.json();
}

async function createClient(data: ClientFormData): Promise<{ data: ClientListItem }> {
  const response = await fetch("/api/v1/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création du client");
  }
  return response.json();
}

async function updateClient({ id, data }: { id: string; data: UpdateClientFormData }): Promise<{ data: ClientListItem }> {
  const response = await fetch(`/api/v1/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la mise à jour du client");
  }
  return response.json();
}

async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/v1/clients/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression du client");
  }
}

// Vehicle API functions
async function fetchVehicles(clientId: string): Promise<{ data: VehicleListItem[] }> {
  const response = await fetch(`/api/v1/clients/${clientId}/vehicles`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération des véhicules");
  }
  return response.json();
}

async function createVehicle({ clientId, data }: { clientId: string; data: VehicleFormData }): Promise<{ data: VehicleListItem }> {
  const response = await fetch(`/api/v1/clients/${clientId}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création du véhicule");
  }
  return response.json();
}

async function updateVehicle({ id, data }: { id: string; data: Partial<VehicleFormData> }): Promise<{ data: VehicleListItem }> {
  const response = await fetch(`/api/v1/vehicles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la mise à jour du véhicule");
  }
  return response.json();
}

async function deleteVehicle(id: string): Promise<void> {
  const response = await fetch(`/api/v1/vehicles/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression du véhicule");
  }
}

// Hooks
export function useClients(params: ClientParams = {}) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => fetchClients(params),
    staleTime: 30_000, // 30 seconds
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => fetchClient(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateClient,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

// Vehicle hooks
export function useVehicles(clientId: string) {
  return useQuery({
    queryKey: vehicleKeys.byClient(clientId),
    queryFn: () => fetchVehicles(clientId),
    enabled: !!clientId,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.byClient(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.clientId) });
    },
  });
}

export function useUpdateVehicle(clientId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.byClient(clientId) });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
    },
  });
}

export function useDeleteVehicle(clientId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.byClient(clientId) });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
    },
  });
}
