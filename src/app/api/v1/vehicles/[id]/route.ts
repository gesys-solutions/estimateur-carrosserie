/**
 * Vehicle Detail API Routes
 * GET /api/v1/vehicles/:id - Get a single vehicle
 * PATCH /api/v1/vehicles/:id - Update a vehicle
 * DELETE /api/v1/vehicles/:id - Delete a vehicle
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { updateVehicleSchema } from "@/lib/validations/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            tenantId: true,
          },
        },
        _count: {
          select: { devis: true },
        },
      },
    });

    if (!vehicle || vehicle.client.tenantId !== tenant.tenantId) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: vehicle.id,
        clientId: vehicle.clientId,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        color: vehicle.color,
        fullName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        client: {
          id: vehicle.client.id,
          fullName: `${vehicle.client.firstName} ${vehicle.client.lastName}`,
        },
        devisCount: vehicle._count.devis,
        createdAt: vehicle.createdAt.toISOString(),
        updatedAt: vehicle.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du véhicule" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Verify vehicle exists and belongs to tenant
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { id },
      include: {
        client: {
          select: { tenantId: true },
        },
      },
    });

    if (!existingVehicle || existingVehicle.client.tenantId !== tenant.tenantId) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = updateVehicleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(data.make && { make: data.make }),
        ...(data.model && { model: data.model }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.vin !== undefined && { vin: data.vin }),
        ...(data.licensePlate !== undefined && { licensePlate: data.licensePlate }),
        ...(data.color !== undefined && { color: data.color }),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "UPDATE",
        entityType: "Vehicle",
        entityId: id,
        details: JSON.stringify({
          changes: data,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: updatedVehicle.id,
        clientId: updatedVehicle.clientId,
        make: updatedVehicle.make,
        model: updatedVehicle.model,
        year: updatedVehicle.year,
        vin: updatedVehicle.vin,
        licensePlate: updatedVehicle.licensePlate,
        color: updatedVehicle.color,
        fullName: `${updatedVehicle.year} ${updatedVehicle.make} ${updatedVehicle.model}`,
        updatedAt: updatedVehicle.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du véhicule" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Verify vehicle exists and belongs to tenant
    const vehicle = await prisma.vehicle.findFirst({
      where: { id },
      include: {
        client: {
          select: { tenantId: true },
        },
        _count: {
          select: { devis: true },
        },
      },
    });

    if (!vehicle || vehicle.client.tenantId !== tenant.tenantId) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Check if vehicle has devis - can't delete if so
    if (vehicle._count.devis > 0) {
      return NextResponse.json(
        { 
          error: "Impossible de supprimer ce véhicule", 
          details: `Ce véhicule a ${vehicle._count.devis} devis associé(s). Veuillez d'abord supprimer ou archiver les devis.`
        },
        { status: 409 }
      );
    }

    // Delete vehicle
    await prisma.vehicle.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "DELETE",
        entityType: "Vehicle",
        entityId: id,
        details: JSON.stringify({
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          licensePlate: vehicle.licensePlate,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du véhicule" },
      { status: 500 }
    );
  }
}
