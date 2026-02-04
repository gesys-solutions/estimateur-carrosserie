/**
 * Client Detail API Routes
 * GET /api/v1/clients/:id - Get a single client with vehicles and devis
 * PATCH /api/v1/clients/:id - Update a client
 * DELETE /api/v1/clients/:id - Soft delete a client
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { updateClientSchema } from "@/lib/validations/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: tenant.where({ id }),
      include: {
        vehicles: {
          orderBy: { createdAt: "desc" },
        },
        devis: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            vehicle: {
              select: {
                make: true,
                model: true,
                year: true,
                licensePlate: true,
              },
            },
            estimateur: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            vehicles: true,
            devis: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    // Calculate stats
    const devisStats = {
      total: client._count.devis,
      totalAmount: client.devis.reduce(
        (sum, d) => sum + (d.totalTTC?.toNumber() || 0),
        0
      ),
      approved: client.devis.filter((d) => d.status === "ACCEPTE").length,
    };

    return NextResponse.json({
      data: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        fullName: `${client.firstName} ${client.lastName}`,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        postalCode: client.postalCode,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
        vehicles: client.vehicles.map((v) => ({
          id: v.id,
          make: v.make,
          model: v.model,
          year: v.year,
          vin: v.vin,
          licensePlate: v.licensePlate,
          color: v.color,
          fullName: `${v.year} ${v.make} ${v.model}`,
          createdAt: v.createdAt.toISOString(),
        })),
        devis: client.devis.map((d) => ({
          id: d.id,
          number: d.devisNumber,
          status: d.status,
          totalTTC: d.totalTTC?.toNumber() || 0,
          vehicle: d.vehicle
            ? `${d.vehicle.year} ${d.vehicle.make} ${d.vehicle.model}`
            : null,
          licensePlate: d.vehicle?.licensePlate,
          estimateur: `${d.estimateur.firstName} ${d.estimateur.lastName}`,
          createdAt: d.createdAt.toISOString(),
        })),
        stats: devisStats,
        counts: client._count,
      },
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du client" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Verify client exists and belongs to tenant
    const existingClient = await prisma.client.findFirst({
      where: tenant.where({ id }),
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = updateClientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
      },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "UPDATE",
        entityType: "Client",
        entityId: id,
        details: JSON.stringify({
          changes: data,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: updatedClient.id,
        firstName: updatedClient.firstName,
        lastName: updatedClient.lastName,
        fullName: `${updatedClient.firstName} ${updatedClient.lastName}`,
        email: updatedClient.email,
        phone: updatedClient.phone,
        address: updatedClient.address,
        city: updatedClient.city,
        postalCode: updatedClient.postalCode,
        vehicleCount: updatedClient._count.vehicles,
        updatedAt: updatedClient.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du client" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Verify client exists and belongs to tenant
    const client = await prisma.client.findFirst({
      where: tenant.where({ id }),
      include: {
        _count: {
          select: { devis: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    // Check if client has devis - can't delete if so
    if (client._count.devis > 0) {
      return NextResponse.json(
        { 
          error: "Impossible de supprimer ce client", 
          details: `Ce client a ${client._count.devis} devis associé(s). Veuillez d'abord supprimer ou archiver les devis.`
        },
        { status: 409 }
      );
    }

    // Delete client (cascade will delete vehicles)
    await prisma.client.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "DELETE",
        entityType: "Client",
        entityId: id,
        details: JSON.stringify({
          name: `${client.firstName} ${client.lastName}`,
          phone: client.phone,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du client" },
      { status: 500 }
    );
  }
}
