"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@/types";

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  fullName: string;
  initials: string;
  role: Role;
  tenantId: string;
  tenantName: string;
}

export interface UseCurrentUserResult {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isEstimator: boolean;
}

/**
 * Hook to access the current authenticated user
 */
export function useCurrentUser(): UseCurrentUserResult {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;

  const user = isAuthenticated
    ? {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        name: session.user.name,
        fullName: `${session.user.firstName} ${session.user.lastName}`,
        initials: `${session.user.firstName.charAt(0)}${session.user.lastName.charAt(0)}`.toUpperCase(),
        role: session.user.role,
        tenantId: session.user.tenantId,
        tenantName: session.user.tenantName,
      }
    : null;

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === "ADMIN",
    isManager: user?.role === "MANAGER",
    isEstimator: user?.role === "ESTIMATOR",
  };
}
