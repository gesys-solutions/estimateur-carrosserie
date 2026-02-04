/**
 * Users API Routes
 * GET /api/v1/users - List users for current tenant (Admin only)
 * POST /api/v1/users - Create a new user (Admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { hashPassword, generateTemporaryPassword } from "@/lib/password";
import { createUserSchema } from "@/lib/validations/auth";
import { canManageUsers } from "@/lib/permissions";
import type { Role } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const tenant = await withTenant();
    
    // Check permissions
    if (!canManageUsers(tenant.role as Role)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Fetch users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: tenant.where(),
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { lastName: "asc" },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: tenant.where(),
      }),
    ]);

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await withTenant();
    
    // Check permissions
    if (!canManageUsers(tenant.role as Role)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, role, password } = validation.data;

    // Check if email already exists in tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: tenant.tenantId,
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec ce courriel existe déjà" },
        { status: 409 }
      );
    }

    // Generate password if not provided
    const userPassword = password || generateTemporaryPassword();
    const hashedPassword = await hashPassword(userPassword);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        tenantId: tenant.tenantId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        role,
        password: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "CREATE",
        entityType: "User",
        entityId: newUser.id,
        details: JSON.stringify({
          email: newUser.email,
          role: newUser.role,
          createdBy: tenant.userId,
        }),
      },
    });

    // Return user with temporary password (for display only in MVP)
    return NextResponse.json({
      ...newUser,
      temporaryPassword: password ? undefined : userPassword,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
