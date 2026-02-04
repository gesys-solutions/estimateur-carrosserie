/**
 * Devis Status Change API Route
 * POST /api/v1/devis/[id]/send - Change devis status to ENVOYE
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { isValidTransition } from "@/lib/validations/devis";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Verify devis exists
    const devis = await prisma.devis.findFirst({
      where: {
        id,
        estimateur: tenant.where(),
      },
      include: {
        items: true,
      },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Check if transition is valid
    if (!isValidTransition(devis.status, 'ENVOYE')) {
      return NextResponse.json(
        { error: `Impossible de passer de ${devis.status} à ENVOYE` },
        { status: 400 }
      );
    }

    // Verify devis has items
    if (devis.items.length === 0) {
      return NextResponse.json(
        { error: "Impossible d'envoyer un devis sans items" },
        { status: 400 }
      );
    }

    // Update status
    const updatedDevis = await prisma.devis.update({
      where: { id },
      data: {
        status: 'ENVOYE',
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
        _count: {
          select: { items: true },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "STATUS_CHANGE",
        entityType: "Devis",
        entityId: id,
        details: JSON.stringify({
          from: devis.status,
          to: 'ENVOYE',
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: updatedDevis.id,
        devisNumber: updatedDevis.devisNumber,
        status: updatedDevis.status,
        client: {
          id: updatedDevis.client.id,
          fullName: `${updatedDevis.client.firstName} ${updatedDevis.client.lastName}`,
          phone: updatedDevis.client.phone,
        },
        vehicle: {
          id: updatedDevis.vehicle.id,
          fullName: `${updatedDevis.vehicle.year} ${updatedDevis.vehicle.make} ${updatedDevis.vehicle.model}`,
          licensePlate: updatedDevis.vehicle.licensePlate,
        },
        estimateur: {
          id: updatedDevis.estimateur.id,
          fullName: `${updatedDevis.estimateur.firstName} ${updatedDevis.estimateur.lastName}`,
        },
        totalHT: Number(updatedDevis.totalHT),
        totalTPS: Number(updatedDevis.totalTPS),
        totalTVQ: Number(updatedDevis.totalTVQ),
        totalTTC: Number(updatedDevis.totalTTC),
        itemCount: updatedDevis._count.items,
        notes: updatedDevis.notes,
        createdAt: updatedDevis.createdAt.toISOString(),
        updatedAt: updatedDevis.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error sending devis:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du devis" },
      { status: 500 }
    );
  }
}
