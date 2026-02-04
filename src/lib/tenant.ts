/**
 * Multi-tenant utilities
 * Provides tenant isolation for all database queries
 */

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get the current tenant context from the request
 * Can be used in both API routes and Server Components
 */
export async function getTenantContext() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  return {
    tenantId: session.user.tenantId,
    userId: session.user.id,
    role: session.user.role,
  };
}

/**
 * Get tenant ID from request headers (set by middleware)
 * Faster alternative for API routes where session is already validated
 */
export async function getTenantIdFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("x-tenant-id");
}

/**
 * Get user ID from request headers
 */
export async function getUserIdFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("x-user-id");
}

/**
 * Get user role from request headers
 */
export async function getUserRoleFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("x-user-role");
}

/**
 * Verify tenant access for a specific resource
 * Returns true if the resource belongs to the user's tenant
 */
export async function verifyTenantAccess(
  resourceTenantId: string
): Promise<boolean> {
  const context = await getTenantContext();
  if (!context) return false;
  return context.tenantId === resourceTenantId;
}

/**
 * Create a Prisma query helper that automatically adds tenant filtering
 * Use this to ensure all queries are tenant-scoped
 *
 * @example
 * const tenantPrisma = await withTenant();
 * const clients = await prisma.client.findMany({
 *   where: tenantPrisma.where({ lastName: "Tremblay" })
 * });
 */
export async function withTenant() {
  const context = await getTenantContext();

  if (!context) {
    throw new Error("Not authenticated");
  }

  return {
    tenantId: context.tenantId,
    userId: context.userId,
    role: context.role,
    
    /**
     * Add tenant filter to a where clause
     */
    where<T extends Record<string, unknown>>(
      additionalFilters?: T
    ): T & { tenantId: string } {
      return {
        ...(additionalFilters || ({} as T)),
        tenantId: context.tenantId,
      };
    },

    /**
     * Add tenant ID to create data
     */
    create<T extends Record<string, unknown>>(data: T): T & { tenantId: string } {
      return {
        ...data,
        tenantId: context.tenantId,
      };
    },
  };
}

/**
 * Verify that a resource belongs to the current tenant
 * Throws an error if access is denied
 */
export async function requireTenantAccess(
  resourceTenantId: string,
  resourceType: string = "resource"
): Promise<void> {
  const hasAccess = await verifyTenantAccess(resourceTenantId);
  
  if (!hasAccess) {
    // Log the attempt
    const context = await getTenantContext();
    if (context) {
      await prisma.auditLog.create({
        data: {
          tenantId: context.tenantId,
          userId: context.userId,
          action: "ACCESS_DENIED",
          entityType: resourceType,
          details: JSON.stringify({
            attemptedTenantId: resourceTenantId,
            reason: "Cross-tenant access attempt",
          }),
        },
      });
    }
    
    throw new Error("Access denied: resource belongs to another tenant");
  }
}
