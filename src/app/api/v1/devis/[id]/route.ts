/**
 * Single Devis API Routes
 * GET /api/v1/devis/[id] - Get devis details
 * PATCH /api/v1/devis/[id] - Update devis
 * DELETE /api/v1/devis/[id] - Delete devis (draft only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { devisUpdateSchema } from "@/lib/validations/devis";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    const devis = await prisma.devis.findFirst({
      where: {
        id,
        estimateur: tenant.where(),
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            postalCode: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            vin: true,
            licensePlate: true,
            color: true,
          },
        },
        estimateur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          orderBy: [
            { type: 'asc' },
            { createdAt: 'asc' },
          ],
        },
        reclamation: {
          include: {
            assurance: {
              select: {
                id: true,
                name: true,
                contactName: true,
                contactPhone: true,
              },
            },
          },
        },
        relances: {
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Group items by type
    const itemsByType = {
      PIECE: devis.items.filter(i => i.type === 'PIECE'),
      MAIN_OEUVRE: devis.items.filter(i => i.type === 'MAIN_OEUVRE'),
      PEINTURE: devis.items.filter(i => i.type === 'PEINTURE'),
      AUTRE: devis.items.filter(i => i.type === 'AUTRE'),
    };

    // Calculate subtotals by type
    const subtotalsByType = {
      PIECE: itemsByType.PIECE.reduce((sum, item) => sum + Number(item.total), 0),
      MAIN_OEUVRE: itemsByType.MAIN_OEUVRE.reduce((sum, item) => sum + Number(item.total), 0),
      PEINTURE: itemsByType.PEINTURE.reduce((sum, item) => sum + Number(item.total), 0),
      AUTRE: itemsByType.AUTRE.reduce((sum, item) => sum + Number(item.total), 0),
    };

    return NextResponse.json({
      data: {
        id: devis.id,
        devisNumber: devis.devisNumber,
        status: devis.status,
        client: {
          id: devis.client.id,
          firstName: devis.client.firstName,
          lastName: devis.client.lastName,
          fullName: `${devis.client.firstName} ${devis.client.lastName}`,
          email: devis.client.email,
          phone: devis.client.phone,
          address: devis.client.address,
          city: devis.client.city,
          postalCode: devis.client.postalCode,
        },
        vehicle: {
          id: devis.vehicle.id,
          make: devis.vehicle.make,
          model: devis.vehicle.model,
          year: devis.vehicle.year,
          vin: devis.vehicle.vin,
          licensePlate: devis.vehicle.licensePlate,
          color: devis.vehicle.color,
          fullName: `${devis.vehicle.year} ${devis.vehicle.make} ${devis.vehicle.model}`,
        },
        estimateur: {
          id: devis.estimateur.id,
          fullName: `${devis.estimateur.firstName} ${devis.estimateur.lastName}`,
          email: devis.estimateur.email,
        },
        items: devis.items.map(item => ({
          id: item.id,
          description: item.description,
          type: item.type,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
          createdAt: item.createdAt.toISOString(),
        })),
        itemsByType,
        subtotalsByType,
        totals: {
          subtotal: Number(devis.totalHT),
          tps: Number(devis.totalTPS),
          tvq: Number(devis.totalTVQ),
          total: Number(devis.totalTTC),
        },
        notes: devis.notes,
        reclamation: devis.reclamation ? {
          id: devis.reclamation.id,
          claimNumber: devis.reclamation.claimNumber,
          agreedPrice: devis.reclamation.agreedPrice ? Number(devis.reclamation.agreedPrice) : null,
          status: devis.reclamation.status,
          assurance: {
            id: devis.reclamation.assurance.id,
            name: devis.reclamation.assurance.name,
            contactName: devis.reclamation.assurance.contactName,
            contactPhone: devis.reclamation.assurance.contactPhone,
          },
        } : null,
        relances: devis.relances.map(r => ({
          id: r.id,
          type: r.type,
          notes: r.notes,
          outcome: r.outcome,
          nextFollowUp: r.nextFollowUp?.toISOString() || null,
          createdBy: `${r.createdBy.firstName} ${r.createdBy.lastName}`,
          createdAt: r.createdAt.toISOString(),
        })),
        itemCount: devis.items.length,
        createdAt: devis.createdAt.toISOString(),
        updatedAt: devis.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching devis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du devis" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Check if devis exists and is editable
    const existingDevis = await prisma.devis.findFirst({
      where: {
        id,
        estimateur: tenant.where(),
      },
    });

    if (!existingDevis) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Only draft devis can be modified
    if (existingDevis.status !== 'BROUILLON') {
      return NextResponse.json(
        { error: "Seuls les devis en brouillon peuvent être modifiés" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = devisUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { clientId, vehicleId, notes } = validation.data;

    // If changing client, verify it belongs to tenant
    if (clientId && clientId !== existingDevis.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          ...tenant.where(),
        },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client non trouvé" },
          { status: 404 }
        );
      }
    }

    // If changing vehicle, verify it belongs to client
    const targetClientId = clientId || existingDevis.clientId;
    if (vehicleId && vehicleId !== existingDevis.vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          clientId: targetClientId,
        },
      });

      if (!vehicle) {
        return NextResponse.json(
          { error: "Véhicule non trouvé ou n'appartient pas au client" },
          { status: 404 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (clientId !== undefined) updateData.clientId = clientId;
    if (vehicleId !== undefined) updateData.vehicleId = vehicleId;
    if (notes !== undefined) updateData.notes = notes;

    // Update devis
    const updatedDevis = await prisma.devis.update({
      where: { id },
      data: updateData,
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
        action: "UPDATE",
        entityType: "Devis",
        entityId: updatedDevis.id,
        details: JSON.stringify(updateData),
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
    console.error("Error updating devis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du devis" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Check if devis exists
    const existingDevis = await prisma.devis.findFirst({
      where: {
        id,
        estimateur: tenant.where(),
      },
    });

    if (!existingDevis) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Only draft devis can be deleted
    if (existingDevis.status !== 'BROUILLON') {
      return NextResponse.json(
        { error: "Seuls les devis en brouillon peuvent être supprimés" },
        { status: 400 }
      );
    }

    // Delete devis (cascades to items)
    await prisma.devis.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "DELETE",
        entityType: "Devis",
        entityId: id,
        details: JSON.stringify({
          devisNumber: existingDevis.devisNumber,
        }),
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting devis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du devis" },
      { status: 500 }
    );
  }
}
