"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth context provider - wraps the app with NextAuth SessionProvider
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
