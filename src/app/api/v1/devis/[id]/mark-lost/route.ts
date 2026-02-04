/**
 * Mark Devis as Lost API
 * POST /api/v1/devis/[id]/mark-lost - Mark a devis as REFUSE with reason
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { markLostSchema } from "@/lib/validations/relance";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Statuses that can be marked as lost
const LOSABLE_STATUSES = ["BROUILLON", "ENVOYE", "EN_NEGOCIATION"];

/**
 * POST /api/v1/devis/[id]/mark-lost
 * Mark a devis as REFUSE (lost) with reason
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Verify devis exists and belongs to tenant
    const devis = await prisma.devis.findFirst({
      where: {
        id,
        estimateur: tenant.where(),
      },
      select: {
        id: true,
        devisNumber: true,
        status: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Validate current status
    if (!LOSABLE_STATUSES.includes(devis.status)) {
      return NextResponse.json(
        {
          error: `Impossible de marquer comme perdu un devis en statut "${devis.status}"`,
          details: `Le devis doit être en statut ${LOSABLE_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validation = markLostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { reason, notes } = validation.data;
    const previousStatus = devis.status;

    // Update devis with lost info
    const updated = await prisma.devis.update({
      where: { id },
      data: {
        status: "REFUSE",
        lostReason: reason,
        lostAt: new Date(),
        lostNotes: notes ?? null,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
        estimateur: {
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
        action: "MARK_LOST",
        entityType: "Devis",
        entityId: id,
        details: JSON.stringify({
          devisNumber: devis.devisNumber,
          previousStatus,
          lostReason: reason,
          lostNotes: notes,
          client: `${devis.client.firstName} ${devis.client.lastName}`,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        devisNumber: updated.devisNumber,
        status: updated.status,
        lostReason: updated.lostReason,
        lostAt: updated.lostAt?.toISOString() ?? null,
        lostNotes: updated.lostNotes,
        client: {
          id: updated.client.id,
          fullName: `${updated.client.firstName} ${updated.client.lastName}`,
          phone: updated.client.phone,
        },
        vehicle: {
          id: updated.vehicle.id,
          fullName: `${updated.vehicle.year} ${updated.vehicle.make} ${updated.vehicle.model}`,
          licensePlate: updated.vehicle.licensePlate,
        },
        estimateur: {
          id: updated.estimateur.id,
          fullName: `${updated.estimateur.firstName} ${updated.estimateur.lastName}`,
        },
        totalTTC: Number(updated.totalTTC),
        previousStatus,
        updatedAt: updated.updatedAt.toISOString(),
      },
      message: "Devis marqué comme perdu",
    });
  } catch (error) {
    console.error("Error marking devis as lost:", error);
    return NextResponse.json(
      { error: "Erreur lors du marquage du devis" },
      { status: 500 }
    );
  }
}
