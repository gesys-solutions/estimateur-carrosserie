// Types centralisés pour l'application
// Ces types seront générés par Prisma une fois le schema défini

export type Role = 'ADMIN' | 'ESTIMATEUR' | 'MANAGER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  clientId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Devis {
  id: string;
  clientId: string;
  vehicleId: string;
  estimateurId: string;
  status: DevisStatus;
  totalHT: number;
  totalTPS: number;
  totalTVQ: number;
  totalTTC: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DevisStatus = 
  | 'BROUILLON'
  | 'ENVOYE'
  | 'EN_NEGOCIATION'
  | 'ACCEPTE'
  | 'REFUSE'
  | 'EN_REPARATION'
  | 'TERMINE';

export interface DevisItem {
  id: string;
  devisId: string;
  description: string;
  type: 'PIECE' | 'MAIN_OEUVRE' | 'PEINTURE' | 'AUTRE';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Assurance {
  id: string;
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reclamation {
  id: string;
  devisId: string;
  assuranceId: string;
  claimNumber?: string;
  agreedPrice?: number;
  status: ReclamationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReclamationStatus = 
  | 'SOUMISE'
  | 'EN_ATTENTE'
  | 'APPROUVEE'
  | 'REFUSEE'
  | 'NEGOCIATION';

export interface Relance {
  id: string;
  devisId: string;
  type: 'APPEL' | 'EMAIL' | 'SMS' | 'VISITE';
  notes: string;
  outcome?: string;
  nextFollowUp?: Date;
  createdBy: string;
  createdAt: Date;
}
