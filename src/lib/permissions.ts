/**
 * Role-Based Access Control (RBAC) System
 * Defines permissions for each role
 */

import type { Role } from "@/types";

// Permission definitions
export const PERMISSIONS = {
  // Estimates
  "estimates:read:all": "Voir tous les devis",
  "estimates:read:own": "Voir ses propres devis",
  "estimates:write:all": "Modifier tous les devis",
  "estimates:write:own": "Modifier ses propres devis",
  "estimates:delete": "Supprimer des devis",
  
  // Clients
  "clients:read": "Voir les clients",
  "clients:write": "Créer/modifier des clients",
  "clients:delete": "Supprimer des clients",
  
  // Users
  "users:read": "Voir les utilisateurs",
  "users:manage": "Gérer les utilisateurs",
  
  // Insurers
  "insurers:read": "Voir les assureurs",
  "insurers:manage": "Gérer les assureurs",
  
  // Dashboard & Reports
  "dashboard:read:all": "Dashboard complet",
  "dashboard:read:own": "Dashboard personnel",
  "reports:read": "Voir les rapports",
  "reports:export": "Exporter les rapports",
  
  // Settings
  "settings:tenant": "Configurer l'atelier",
} as const;

export type Permission = keyof typeof PERMISSIONS;

// Role permissions mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Full access
    "estimates:read:all",
    "estimates:write:all",
    "estimates:delete",
    "clients:read",
    "clients:write",
    "clients:delete",
    "users:read",
    "users:manage",
    "insurers:read",
    "insurers:manage",
    "dashboard:read:all",
    "reports:read",
    "reports:export",
    "settings:tenant",
  ],
  MANAGER: [
    // All estimates, reports, no user management
    "estimates:read:all",
    "estimates:write:all",
    "estimates:delete",
    "clients:read",
    "clients:write",
    "clients:delete",
    "users:read", // Can view but not manage
    "insurers:read",
    "insurers:manage",
    "dashboard:read:all",
    "reports:read",
    "reports:export",
  ],
  ESTIMATOR: [
    // Own estimates only
    "estimates:read:own",
    "estimates:write:own",
    "clients:read",
    "clients:write",
    "insurers:read",
    "dashboard:read:own",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user can access all resources (vs just own)
 */
export function canAccessAll(role: Role, resource: "estimates" | "dashboard"): boolean {
  const permission = `${resource}:read:all` as Permission;
  return hasPermission(role, permission);
}

/**
 * Check if user can manage users
 */
export function canManageUsers(role: Role): boolean {
  return hasPermission(role, "users:manage");
}

/**
 * Check if user can access settings
 */
export function canAccessSettings(role: Role): boolean {
  return hasPermission(role, "settings:tenant") || hasPermission(role, "users:manage");
}
