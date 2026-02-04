import { z } from 'zod';

// Phone regex: accepts (xxx) xxx-xxxx, xxx-xxx-xxxx, or xxxxxxxxxx
const phoneRegex = /^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;

export const clientSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100),
  lastName: z.string().min(1, 'Le nom est requis').max(100),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string()
    .min(10, 'Numéro de téléphone invalide')
    .max(20)
    .regex(phoneRegex, 'Format de téléphone invalide'),
  address: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(10).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Schema for updating a client (all fields optional except id in route)
export const updateClientSchema = clientSchema.partial();
export type UpdateClientFormData = z.infer<typeof updateClientSchema>;

// Schema for search
export const clientSearchSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['lastName', 'firstName', 'createdAt', 'phone']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Vehicle schemas
export const vehicleSchema = z.object({
  make: z.string().min(1, 'La marque est requise').max(50),
  model: z.string().min(1, 'Le modèle est requis').max(50),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string()
    .length(17, 'Le VIN doit avoir 17 caractères')
    .optional()
    .or(z.literal('')),
  licensePlate: z.string().max(10).optional().or(z.literal('')),
  color: z.string().max(30).optional().or(z.literal('')),
  mileage: z.number().min(0).optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

// For creating a vehicle with clientId
export const createVehicleSchema = vehicleSchema.extend({
  clientId: z.string().uuid('ID client invalide'),
});

export type CreateVehicleFormData = z.infer<typeof createVehicleSchema>;

// Schema for updating a vehicle
export const updateVehicleSchema = vehicleSchema.partial();
export type UpdateVehicleFormData = z.infer<typeof updateVehicleSchema>;

// Quick reception form: client + vehicle in one
export const quickReceptionSchema = z.object({
  client: clientSchema,
  vehicle: vehicleSchema,
});

export type QuickReceptionFormData = z.infer<typeof quickReceptionSchema>;
