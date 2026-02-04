import { z } from 'zod';

export const devisItemSchema = z.object({
  description: z.string().min(1, 'Description requise').max(500),
  type: z.enum(['PIECE', 'MAIN_OEUVRE', 'PEINTURE', 'AUTRE']),
  quantity: z.number().min(0.01, 'Quantité doit être positive'),
  unitPrice: z.number().min(0, 'Prix doit être positif'),
});

export type DevisItemFormData = z.infer<typeof devisItemSchema>;

export const devisSchema = z.object({
  clientId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
  items: z.array(devisItemSchema).min(1, 'Au moins un item requis'),
});

export type DevisFormData = z.infer<typeof devisSchema>;

// Taux de taxes Québec
export const TPS_RATE = 0.05; // 5%
export const TVQ_RATE = 0.09975; // 9.975%

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
