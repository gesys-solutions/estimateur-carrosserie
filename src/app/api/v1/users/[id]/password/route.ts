/**
 * Password Change API Route
 * PATCH /api/v1/users/:id/password - Change user password
 */

import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { hashPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validations/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tenant = await withTenant();

    // Users can only change their own password (or admins can reset)
    const isSelf = id === tenant.userId;
    const isAdmin = tenant.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Fetch user
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

    // Verify current password (only for self-change)
    if (isSelf) {
      const isValidPassword = await compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Mot de passe actuel incorrect" },
          { status: 400 }
        );
      }
    }

    // Hash and update new password
    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id },
      data: { password: newPasswordHash },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "PASSWORD_CHANGE",
        entityType: "User",
        entityId: id,
        details: JSON.stringify({
          changedBy: tenant.userId,
          isSelf,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    );
  }
}
