import { z } from 'zod';

// ===== ENUMS =====

export const ReclamationStatus = {
  SOUMISE: 'SOUMISE',
  EN_ATTENTE: 'EN_ATTENTE',
  APPROUVEE: 'APPROUVEE',
  REFUSEE: 'REFUSEE',
  NEGOCIATION: 'NEGOCIATION',
  PAYEE: 'PAYEE',
} as const;

export type ReclamationStatusType = keyof typeof ReclamationStatus;

export const ReclamationStatusLabels: Record<ReclamationStatusType, string> = {
  SOUMISE: 'Soumise',
  EN_ATTENTE: 'En attente',
  APPROUVEE: 'Approuvée',
  REFUSEE: 'Refusée',
  NEGOCIATION: 'En négociation',
  PAYEE: 'Payée',
};

export const ReclamationStatusColors: Record<ReclamationStatusType, string> = {
  SOUMISE: 'bg-blue-100 text-blue-800',
  EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
  APPROUVEE: 'bg-green-100 text-green-800',
  REFUSEE: 'bg-red-100 text-red-800',
  NEGOCIATION: 'bg-orange-100 text-orange-800',
  PAYEE: 'bg-emerald-100 text-emerald-800',
};

// ===== ASSURANCE SCHEMAS =====

export const assuranceSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  contactName: z.string().max(100).optional().nullable(),
  contactEmail: z.string().email('Email invalide').optional().nullable().or(z.literal('')),
  contactPhone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type AssuranceFormData = z.infer<typeof assuranceSchema>;

export const assuranceUpdateSchema = assuranceSchema.partial();

export type AssuranceUpdateFormData = z.infer<typeof assuranceUpdateSchema>;

export const assuranceSearchSchema = z.object({
  q: z.string().optional(),
  includeInactive: z.coerce.boolean().optional().default(false),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type AssuranceSearchParams = z.infer<typeof assuranceSearchSchema>;

// ===== RECLAMATION SCHEMAS =====

export const reclamationCreateSchema = z.object({
  assuranceId: z.string().uuid('Compagnie d\'assurance requise'),
  claimNumber: z.string().max(100).optional().nullable(),
  adjusterName: z.string().max(100).optional().nullable(),
  adjusterPhone: z.string().max(20).optional().nullable(),
  adjusterEmail: z.string().email('Email invalide').optional().nullable().or(z.literal('')),
  notes: z.string().max(2000).optional().nullable(),
});

export type ReclamationCreateFormData = z.infer<typeof reclamationCreateSchema>;

export const reclamationUpdateSchema = z.object({
  assuranceId: z.string().uuid().optional(),
  claimNumber: z.string().max(100).optional().nullable(),
  adjusterName: z.string().max(100).optional().nullable(),
  adjusterPhone: z.string().max(20).optional().nullable(),
  adjusterEmail: z.string().email('Email invalide').optional().nullable().or(z.literal('')),
  status: z.enum(['SOUMISE', 'EN_ATTENTE', 'APPROUVEE', 'REFUSEE', 'NEGOCIATION', 'PAYEE']).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export type ReclamationUpdateFormData = z.infer<typeof reclamationUpdateSchema>;

// ===== AGREED PRICE SCHEMA =====

export const agreedPriceSchema = z.object({
  agreedPrice: z.number().min(0, 'Le prix doit être positif'),
  notes: z.string().max(2000).optional().nullable(),
});

export type AgreedPriceFormData = z.infer<typeof agreedPriceSchema>;

// ===== NEGOTIATION NOTE SCHEMA =====

export const negotiationNoteSchema = z.object({
  content: z.string().min(1, 'Contenu requis').max(5000),
});

export type NegotiationNoteFormData = z.infer<typeof negotiationNoteSchema>;

// ===== HELPER FUNCTIONS =====

/**
 * Calculate the difference between agreed price and original price
 */
export function calculatePriceDifference(
  originalPrice: number,
  agreedPrice: number
): { difference: number; percentage: number; isGain: boolean } {
  const difference = agreedPrice - originalPrice;
  const percentage = originalPrice > 0 ? (difference / originalPrice) * 100 : 0;
  
  return {
    difference: Math.round(difference * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    isGain: difference > 0,
  };
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(price);
}
