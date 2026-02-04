import { z } from 'zod';

export const clientSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100),
  lastName: z.string().min(1, 'Le nom est requis').max(100),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().min(10, 'Numéro de téléphone invalide').max(20),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(10).optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const vehicleSchema = z.object({
  clientId: z.string().uuid(),
  make: z.string().min(1, 'La marque est requise').max(50),
  model: z.string().min(1, 'Le modèle est requis').max(50),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().length(17, 'Le VIN doit avoir 17 caractères').optional().or(z.literal('')),
  licensePlate: z.string().max(10).optional(),
  color: z.string().max(30).optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
