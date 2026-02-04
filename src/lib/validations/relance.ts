/**
 * Validation schemas for Relances (follow-ups)
 */

import { z } from "zod";

// Types d'enum pour les relances
export const RelanceTypeEnum = z.enum(["APPEL", "EMAIL", "SMS", "VISITE"]);
export type RelanceTypeType = z.infer<typeof RelanceTypeEnum>;

// Types d'enum pour les raisons de perte
export const LostReasonEnum = z.enum(["PRICE", "DELAY", "COMPETITOR", "NO_RESPONSE", "OTHER"]);
export type LostReasonType = z.infer<typeof LostReasonEnum>;

// Labels en français
export const RelanceTypeLabels: Record<RelanceTypeType, string> = {
  APPEL: "Appel téléphonique",
  EMAIL: "Courriel",
  SMS: "SMS",
  VISITE: "Visite en personne",
};

export const LostReasonLabels: Record<LostReasonType, string> = {
  PRICE: "Prix trop élevé",
  DELAY: "Délais trop longs",
  COMPETITOR: "Concurrent choisi",
  NO_RESPONSE: "Pas de réponse",
  OTHER: "Autre raison",
};

/**
 * Schema for creating a new relance
 */
export const createRelanceSchema = z.object({
  type: RelanceTypeEnum,
  notes: z.string().min(1, "Les notes sont requises").max(2000),
  outcome: z.string().max(500).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  nextFollowUp: z.string().datetime().optional().nullable(),
});

export type CreateRelanceInput = z.infer<typeof createRelanceSchema>;

/**
 * Schema for updating a relance
 */
export const updateRelanceSchema = z.object({
  notes: z.string().min(1).max(2000).optional(),
  outcome: z.string().max(500).optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  nextFollowUp: z.string().datetime().optional().nullable(),
});

export type UpdateRelanceInput = z.infer<typeof updateRelanceSchema>;

/**
 * Schema for marking a devis as lost
 */
export const markLostSchema = z.object({
  reason: LostReasonEnum,
  notes: z.string().max(2000).optional(),
});

export type MarkLostInput = z.infer<typeof markLostSchema>;

/**
 * Schema for to-follow-up query params
 */
export const toFollowUpQuerySchema = z.object({
  daysThreshold: z.coerce.number().int().positive().default(7),
  estimateurId: z.string().uuid().optional(),
  status: z.enum(["BROUILLON", "ENVOYE", "EN_NEGOCIATION"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ToFollowUpQueryParams = z.infer<typeof toFollowUpQuerySchema>;
