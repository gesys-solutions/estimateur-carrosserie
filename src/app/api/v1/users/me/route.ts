/**
 * Current User API Routes
 * GET /api/v1/users/me - Get current user profile
 * PUT /api/v1/users/me - Update current user profile
 * POST /api/v1/users/me/password - Change password
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function GET() {
  try {
    const tenant = await withTenant();

    const user = await prisma.user.findUnique({
      where: { id: tenant.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
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
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenant = await withTenant();
    const body = await request.json();

    // Validate input
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { firstName, lastName } = validation.data;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: tenant.userId },
      data: {
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "UPDATE_PROFILE",
        entityType: "User",
        entityId: tenant.userId,
        details: JSON.stringify({ firstName, lastName }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await withTenant();
    const body = await request.json();

    // Check if this is a password change request
    if (body.action !== "change-password") {
      return NextResponse.json(
        { error: "Action non reconnue" },
        { status: 400 }
      );
    }

    // Validate input
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: tenant.userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 400 }
      );
    }

    // Hash and update password
    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: tenant.userId },
      data: { passwordHash: newPasswordHash },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "PASSWORD_CHANGE",
        entityType: "User",
        entityId: tenant.userId,
      },
    });

    return NextResponse.json({ success: true, message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    );
  }
}
