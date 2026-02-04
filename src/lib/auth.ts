import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types";

/**
 * NextAuth.js v5 configuration for EstimPro
 * Uses Credentials provider with email/password authentication
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      name: string;
      role: Role;
      tenantId: string;
      tenantName: string;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    tenantId: string;
    tenantName: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email (across all tenants for now)
        const user = await prisma.user.findFirst({
          where: {
            email: email.toLowerCase(),
            isActive: true,
          },
          include: {
            tenant: true,
          },
        });

        if (!user) {
          throw new Error("Identifiants invalides");
        }

        // Verify password
        const isValidPassword = await compare(password, user.passwordHash);
        if (!isValidPassword) {
          throw new Error("Identifiants invalides");
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as Role,
          tenantId: user.tenantId,
          tenantName: user.tenant.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token["id"] = user.id;
        token["email"] = user.email;
        token["firstName"] = user.firstName;
        token["lastName"] = user.lastName;
        token["role"] = user.role;
        token["tenantId"] = user.tenantId;
        token["tenantName"] = user.tenantName;
      }
      return token;
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as any) = {
        id: token["id"] as string,
        email: token["email"] as string,
        firstName: token["firstName"] as string,
        lastName: token["lastName"] as string,
        name: `${token["firstName"]} ${token["lastName"]}`,
        role: token["role"] as Role,
        tenantId: token["tenantId"] as string,
        tenantName: token["tenantName"] as string,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after login
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
});
