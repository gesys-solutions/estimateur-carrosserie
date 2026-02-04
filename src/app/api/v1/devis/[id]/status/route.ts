/**
 * Devis Status API Route
 * POST /api/v1/devis/[id]/status - Change devis status with validation
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { statusChangeSchema, isValidTransition, DevisStatusType } from "@/lib/validations/devis";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    const body = await request.json();
    
    // Validate input
    const validation = statusChangeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { status: newStatus, notes } = validation.data;

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

    const currentStatus = devis.status as DevisStatusType;

    // Check if transition is valid
    if (!isValidTransition(currentStatus, newStatus)) {
      return NextResponse.json(
        { error: `Transition de ${currentStatus} vers ${newStatus} non autorisée` },
        { status: 400 }
      );
    }

    // If sending, verify devis has items
    if (newStatus === 'ENVOYE' && devis.items.length === 0) {
      return NextResponse.json(
        { error: "Impossible d'envoyer un devis sans items" },
        { status: 400 }
      );
    }

    // Update status
    const updatedDevis = await prisma.devis.update({
      where: { id },
      data: {
        status: newStatus,
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

    // Audit log with notes
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "STATUS_CHANGE",
        entityType: "Devis",
        entityId: id,
        details: JSON.stringify({
          from: currentStatus,
          to: newStatus,
          notes: notes || null,
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
      previousStatus: currentStatus,
    });
  } catch (error) {
    console.error("Error changing devis status:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de statut" },
      { status: 500 }
    );
  }
}
