/**
 * Single User API Routes
 * GET /api/v1/users/:id - Get user details
 * PUT /api/v1/users/:id - Update user
 * PATCH /api/v1/users/:id - Partial update (e.g., deactivate)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { updateUserSchema } from "@/lib/validations/auth";
import { hashPassword, generateTemporaryPassword } from "@/lib/password";
import { canManageUsers } from "@/lib/permissions";
import type { Role } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tenant = await withTenant();

    const user = await prisma.user.findFirst({
      where: {
        id,
        tenantId: tenant.tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Check user exists and belongs to tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        tenantId: tenant.tenantId,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Prevent admin from deactivating themselves
    if (
      id === tenant.userId &&
      validation.data.isActive === false
    ) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous désactiver vous-même" },
        { status: 400 }
      );
    }

    // Prevent removing last admin
    if (
      existingUser.role === "ADMIN" &&
      validation.data.role &&
      validation.data.role !== "ADMIN"
    ) {
      const adminCount = await prisma.user.count({
        where: {
          tenantId: tenant.tenantId,
          role: "ADMIN",
          isActive: true,
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Impossible de retirer le dernier administrateur" },
          { status: 400 }
        );
      }
    }

    // Update user - filter out undefined values for Prisma
    const updateData: Record<string, unknown> = {};
    if (validation.data["firstName"] !== undefined) updateData["firstName"] = validation.data["firstName"];
    if (validation.data["lastName"] !== undefined) updateData["lastName"] = validation.data["lastName"];
    if (validation.data["role"] !== undefined) updateData["role"] = validation.data["role"];
    if (validation.data["isActive"] !== undefined) updateData["isActive"] = validation.data["isActive"];

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        updatedAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "UPDATE",
        entityType: "User",
        entityId: id,
        details: JSON.stringify({
          changes: validation.data,
          updatedBy: tenant.userId,
        }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tenant = await withTenant();

    if (!canManageUsers(tenant.role as Role)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // Check user exists
    const user = await prisma.user.findFirst({
      where: {
        id,
        tenantId: tenant.tenantId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Handle specific actions
    if (action === "deactivate") {
      if (id === tenant.userId) {
        return NextResponse.json(
          { error: "Vous ne pouvez pas vous désactiver vous-même" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: tenant.tenantId,
          userId: tenant.userId,
          action: "DEACTIVATE",
          entityType: "User",
          entityId: id,
        },
      });

      return NextResponse.json({ success: true, message: "Utilisateur désactivé" });
    }

    if (action === "activate") {
      await prisma.user.update({
        where: { id },
        data: { isActive: true },
      });

      return NextResponse.json({ success: true, message: "Utilisateur réactivé" });
    }

    if (action === "reset-password") {
      const newPassword = generateTemporaryPassword();
      const passwordHash = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: tenant.tenantId,
          userId: tenant.userId,
          action: "PASSWORD_RESET",
          entityType: "User",
          entityId: id,
        },
      });

      return NextResponse.json({
        success: true,
        temporaryPassword: newPassword,
      });
    }

    return NextResponse.json(
      { error: "Action non reconnue" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in user action:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'opération" },
      { status: 500 }
    );
  }
}
