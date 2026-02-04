// Shared TypeScript types for EstimPro
// These complement the Prisma-generated types

/**
 * User roles in the system
 */
export type Role = "ADMIN" | "MANAGER" | "ESTIMATOR";

/**
 * Estimate status workflow
 */
export type EstimateStatus =
  | "DRAFT" // En cours de création
  | "SUBMITTED" // Envoyé à l'assureur
  | "NEGOTIATION" // Contre-offre reçue
  | "APPROVED" // Prix convenu accepté
  | "SIGNED" // Autorisations signées
  | "IN_REPAIR" // Véhicule en atelier
  | "READY" // Réparation terminée
  | "DELIVERED" // Véhicule livré
  | "CLOSED" // Dossier archivé
  | "LOST"; // Devis non converti

/**
 * Line item types
 */
export type LineItemType = "LABOR" | "PART" | "PAINT" | "MISC";

/**
 * Signature types
 */
export type SignatureType = "AUTHORIZATION" | "DELIVERY" | "ESTIMATE";

/**
 * Tax configuration for Quebec
 */
export interface TaxConfig {
  tps: number; // Federal GST (5%)
  tvq: number; // Quebec QST (9.975%)
}

/**
 * Status labels in French
 */
export const STATUS_LABELS: Record<EstimateStatus, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  NEGOTIATION: "Négociation",
  APPROVED: "Approuvé",
  SIGNED: "Signé",
  IN_REPAIR: "En réparation",
  READY: "Prêt",
  DELIVERED: "Livré",
  CLOSED: "Fermé",
  LOST: "Perdu",
};

/**
 * Status colors for badges (Tailwind classes)
 */
export const STATUS_COLORS: Record<EstimateStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  NEGOTIATION: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  SIGNED: "bg-emerald-100 text-emerald-800",
  IN_REPAIR: "bg-orange-100 text-orange-800",
  READY: "bg-teal-100 text-teal-800",
  DELIVERED: "bg-indigo-100 text-indigo-800",
  CLOSED: "bg-slate-100 text-slate-800",
  LOST: "bg-red-100 text-red-800",
};

/**
 * Line item type labels
 */
export const LINE_ITEM_LABELS: Record<LineItemType, string> = {
  LABOR: "Main d'œuvre",
  PART: "Pièce",
  PAINT: "Peinture",
  MISC: "Divers",
};

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
