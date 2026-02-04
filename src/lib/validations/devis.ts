import { z } from 'zod';

// Taux de taxes Québec
export const TPS_RATE = 0.05; // 5%
export const TVQ_RATE = 0.09975; // 9.975%

// Enums matching Prisma schema
export const DevisStatus = {
  BROUILLON: 'BROUILLON',
  ENVOYE: 'ENVOYE',
  EN_NEGOCIATION: 'EN_NEGOCIATION',
  ACCEPTE: 'ACCEPTE',
  REFUSE: 'REFUSE',
  EN_REPARATION: 'EN_REPARATION',
  TERMINE: 'TERMINE',
} as const;

export type DevisStatusType = keyof typeof DevisStatus;

export const DevisItemType = {
  PIECE: 'PIECE',
  MAIN_OEUVRE: 'MAIN_OEUVRE',
  PEINTURE: 'PEINTURE',
  AUTRE: 'AUTRE',
} as const;

export type DevisItemTypeType = keyof typeof DevisItemType;

// Status labels for UI
export const DevisStatusLabels: Record<DevisStatusType, string> = {
  BROUILLON: 'Brouillon',
  ENVOYE: 'Envoyé',
  EN_NEGOCIATION: 'En négociation',
  ACCEPTE: 'Accepté',
  REFUSE: 'Refusé',
  EN_REPARATION: 'En réparation',
  TERMINE: 'Terminé',
};

export const DevisStatusColors: Record<DevisStatusType, string> = {
  BROUILLON: 'bg-gray-100 text-gray-800',
  ENVOYE: 'bg-blue-100 text-blue-800',
  EN_NEGOCIATION: 'bg-yellow-100 text-yellow-800',
  ACCEPTE: 'bg-green-100 text-green-800',
  REFUSE: 'bg-red-100 text-red-800',
  EN_REPARATION: 'bg-purple-100 text-purple-800',
  TERMINE: 'bg-emerald-100 text-emerald-800',
};

export const DevisItemTypeLabels: Record<DevisItemTypeType, string> = {
  PIECE: 'Pièce',
  MAIN_OEUVRE: "Main d'œuvre",
  PEINTURE: 'Peinture',
  AUTRE: 'Autre',
};

// Valid status transitions
export const ValidStatusTransitions: Record<DevisStatusType, DevisStatusType[]> = {
  BROUILLON: ['ENVOYE'],
  ENVOYE: ['EN_NEGOCIATION', 'ACCEPTE', 'REFUSE'],
  EN_NEGOCIATION: ['ACCEPTE', 'REFUSE'],
  ACCEPTE: ['EN_REPARATION', 'REFUSE'],
  REFUSE: ['BROUILLON'], // Can reopen as draft
  EN_REPARATION: ['TERMINE'],
  TERMINE: [], // Final state
};

// Check if transition is allowed
export function isValidTransition(from: DevisStatusType, to: DevisStatusType): boolean {
  return ValidStatusTransitions[from]?.includes(to) ?? false;
}

// Schemas for validation
export const devisItemSchema = z.object({
  description: z.string().min(1, 'Description requise').max(500),
  type: z.enum(['PIECE', 'MAIN_OEUVRE', 'PEINTURE', 'AUTRE']),
  quantity: z.coerce.number().min(0.01, 'Quantité doit être positive'),
  unitPrice: z.coerce.number().min(0, 'Prix doit être positif ou zéro'),
});

export type DevisItemFormData = z.infer<typeof devisItemSchema>;

export const devisSchema = z.object({
  clientId: z.string().uuid('Client requis'),
  vehicleId: z.string().uuid('Véhicule requis'),
  notes: z.string().max(2000).optional().nullable(),
});

export type DevisFormData = z.infer<typeof devisSchema>;

export const devisUpdateSchema = z.object({
  clientId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export type DevisUpdateFormData = z.infer<typeof devisUpdateSchema>;

export const devisSearchSchema = z.object({
  q: z.string().optional(),
  status: z.enum(['BROUILLON', 'ENVOYE', 'EN_NEGOCIATION', 'ACCEPTE', 'REFUSE', 'EN_REPARATION', 'TERMINE']).optional(),
  clientId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['devisNumber', 'createdAt', 'updatedAt', 'totalTTC', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type DevisSearchParams = z.infer<typeof devisSearchSchema>;

export const statusChangeSchema = z.object({
  status: z.enum(['BROUILLON', 'ENVOYE', 'EN_NEGOCIATION', 'ACCEPTE', 'REFUSE', 'EN_REPARATION', 'TERMINE']),
  notes: z.string().max(1000).optional(),
});

export type StatusChangeFormData = z.infer<typeof statusChangeSchema>;

/**
 * Calculate taxes and totals from subtotal
 */
export function calculateTaxes(subtotal: number) {
  const tps = subtotal * TPS_RATE;
  const tvq = subtotal * TVQ_RATE;
  const total = subtotal + tps + tvq;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tps: Math.round(tps * 100) / 100,
    tvq: Math.round(tvq * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Calculate item total from quantity and unit price
 */
export function calculateItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Generate a unique devis number
 * Format: DV-YYYY-NNNN (e.g., DV-2026-0001)
 */
export function generateDevisNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = String(sequence).padStart(4, '0');
  return `DV-${year}-${paddedSequence}`;
}
