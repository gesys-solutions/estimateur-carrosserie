/**
 * Client Vehicles API Routes
 * GET /api/v1/clients/:id/vehicles - List vehicles for a client
 * POST /api/v1/clients/:id/vehicles - Add a vehicle to a client
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { vehicleSchema } from "@/lib/validations/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id: clientId } = await params;

    // Verify client exists and belongs to tenant
    const client = await prisma.client.findFirst({
      where: tenant.where({ id: clientId }),
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { devis: true },
        },
      },
    });

    const data = vehicles.map((v) => ({
      id: v.id,
      make: v.make,
      model: v.model,
      year: v.year,
      vin: v.vin,
      licensePlate: v.licensePlate,
      color: v.color,
      fullName: `${v.year} ${v.make} ${v.model}`,
      devisCount: v._count.devis,
      createdAt: v.createdAt.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des véhicules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id: clientId } = await params;

    // Verify client exists and belongs to tenant
    const client = await prisma.client.findFirst({
      where: tenant.where({ id: clientId }),
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = vehicleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create vehicle
    const newVehicle = await prisma.vehicle.create({
      data: {
        clientId,
        make: data.make,
        model: data.model,
        year: data.year,
        vin: data.vin,
        licensePlate: data.licensePlate,
        color: data.color,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "CREATE",
        entityType: "Vehicle",
        entityId: newVehicle.id,
        details: JSON.stringify({
          clientId,
          vehicle: `${newVehicle.year} ${newVehicle.make} ${newVehicle.model}`,
          licensePlate: newVehicle.licensePlate,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: newVehicle.id,
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year,
        vin: newVehicle.vin,
        licensePlate: newVehicle.licensePlate,
        color: newVehicle.color,
        fullName: `${newVehicle.year} ${newVehicle.make} ${newVehicle.model}`,
        createdAt: newVehicle.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du véhicule" },
      { status: 500 }
    );
  }
}
