"use client";

/**
 * RoleGate Component
 * Conditionally renders children based on user role
 */

import type { Role } from "@/types";
import { useCurrentUser } from "@/hooks/use-current-user";

interface RoleGateProps {
  children: React.ReactNode;
  allow: Role[];
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

/**
 * RoleGate - Show content only if user has one of the allowed roles
 *
 * @example
 * <RoleGate allow={["ADMIN", "MANAGER"]}>
 *   <AdminPanel />
 * </RoleGate>
 */
export function RoleGate({
  children,
  allow,
  fallback = null,
  showLoading = false,
}: RoleGateProps) {
  const { user, isLoading } = useCurrentUser();

  // Show nothing while loading (or loading indicator if enabled)
  if (isLoading) {
    if (showLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    }
    return null;
  }

  // No user or role not allowed
  if (!user || !allow.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * AdminOnly - Shorthand for admin-only content
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGate allow={["ADMIN"]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * ManagerOrAdmin - Content for managers and admins
 */
export function ManagerOrAdmin({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGate allow={["ADMIN", "MANAGER"]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
