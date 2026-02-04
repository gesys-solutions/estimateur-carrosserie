/**
 * Relance API Routes
 * PATCH /api/v1/relances/[id] - Update a relance
 * DELETE /api/v1/relances/[id] - Delete a relance
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { updateRelanceSchema } from "@/lib/validations/relance";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/relances/[id]
 * Update a relance (e.g., mark as completed)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Find relance and verify access
    const relance = await prisma.relance.findUnique({
      where: { id },
      include: {
        devis: {
          include: {
            estimateur: {
              select: { tenantId: true },
            },
          },
        },
      },
    });

    if (!relance) {
      return NextResponse.json(
        { error: "Relance non trouvée" },
        { status: 404 }
      );
    }

    // Verify tenant access
    if (relance.devis.estimateur.tenantId !== tenant.tenantId) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validation = updateRelanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { notes, outcome, completedAt, nextFollowUp } = validation.data;

    // Update relance
    const updated = await prisma.relance.update({
      where: { id },
      data: {
        ...(notes !== undefined && { notes }),
        ...(outcome !== undefined && { outcome }),
        ...(completedAt !== undefined && { 
          completedAt: completedAt ? new Date(completedAt) : null 
        }),
        ...(nextFollowUp !== undefined && { 
          nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null 
        }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "UPDATE",
        entityType: "Relance",
        entityId: id,
        details: JSON.stringify({ updates: validation.data }),
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        type: updated.type,
        notes: updated.notes,
        outcome: updated.outcome,
        scheduledAt: updated.scheduledAt?.toISOString() ?? null,
        completedAt: updated.completedAt?.toISOString() ?? null,
        nextFollowUp: updated.nextFollowUp?.toISOString() ?? null,
        createdBy: {
          id: updated.createdBy.id,
          fullName: `${updated.createdBy.firstName} ${updated.createdBy.lastName}`,
        },
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating relance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la relance" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/relances/[id]
 * Delete a relance
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Find relance and verify access
    const relance = await prisma.relance.findUnique({
      where: { id },
      include: {
        devis: {
          include: {
            estimateur: {
              select: { tenantId: true },
            },
          },
        },
      },
    });

    if (!relance) {
      return NextResponse.json(
        { error: "Relance non trouvée" },
        { status: 404 }
      );
    }

    // Verify tenant access
    if (relance.devis.estimateur.tenantId !== tenant.tenantId) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    // Delete relance
    await prisma.relance.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "DELETE",
        entityType: "Relance",
        entityId: id,
        details: JSON.stringify({ devisId: relance.devisId }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting relance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la relance" },
      { status: 500 }
    );
  }
}
