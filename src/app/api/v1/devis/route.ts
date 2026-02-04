/**
 * Devis API Routes
 * GET /api/v1/devis - List devis for current tenant (with search/pagination)
 * POST /api/v1/devis - Create a new devis
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { devisSchema, devisSearchSchema, generateDevisNumber } from "@/lib/validations/devis";

export async function GET(request: NextRequest) {
  try {
    const tenant = await withTenant();
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const params = devisSearchSchema.safeParse({
      q: searchParams.get("q") || undefined,
      status: searchParams.get("status") || undefined,
      clientId: searchParams.get("clientId") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    if (!params.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: params.error.flatten() },
        { status: 400 }
      );
    }

    const { q, status, clientId, page, limit, sortBy, sortOrder } = params.data;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: Record<string, unknown> = {};

    if (q) {
      whereConditions.OR = [
        { devisNumber: { contains: q } },
        { client: { firstName: { contains: q } } },
        { client: { lastName: { contains: q } } },
        { vehicle: { licensePlate: { contains: q } } },
        { vehicle: { make: { contains: q } } },
      ];
    }

    if (status) {
      whereConditions.status = status;
    }

    if (clientId) {
      whereConditions.clientId = clientId;
    }

    // Fetch devis with relations
    const [devisList, total] = await Promise.all([
      prisma.devis.findMany({
        where: {
          estimateur: tenant.where(),
          ...whereConditions,
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
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.devis.count({
        where: {
          estimateur: tenant.where(),
          ...whereConditions,
        },
      }),
    ]);

    // Transform for response
    const data = devisList.map((devis) => ({
      id: devis.id,
      devisNumber: devis.devisNumber,
      status: devis.status,
      client: {
        id: devis.client.id,
        fullName: `${devis.client.firstName} ${devis.client.lastName}`,
        phone: devis.client.phone,
      },
      vehicle: {
        id: devis.vehicle.id,
        fullName: `${devis.vehicle.year} ${devis.vehicle.make} ${devis.vehicle.model}`,
        licensePlate: devis.vehicle.licensePlate,
      },
      estimateur: {
        id: devis.estimateur.id,
        fullName: `${devis.estimateur.firstName} ${devis.estimateur.lastName}`,
      },
      totalHT: Number(devis.totalHT),
      totalTPS: Number(devis.totalTPS),
      totalTVQ: Number(devis.totalTVQ),
      totalTTC: Number(devis.totalTTC),
      itemCount: devis._count.items,
      notes: devis.notes,
      createdAt: devis.createdAt.toISOString(),
      updatedAt: devis.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching devis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des devis" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await withTenant();
    
    const body = await request.json();
    
    // Validate input
    const validation = devisSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { clientId, vehicleId, notes } = validation.data;

    // Verify client belongs to tenant
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

    // Verify vehicle belongs to client
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        clientId: clientId,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé ou n'appartient pas au client" },
        { status: 404 }
      );
    }

    // Get next sequence number for this tenant
    const lastDevis = await prisma.devis.findFirst({
      where: {
        estimateur: tenant.where(),
        devisNumber: { startsWith: `DV-${new Date().getFullYear()}-` },
      },
      orderBy: { devisNumber: 'desc' },
      select: { devisNumber: true },
    });

    let sequence = 1;
    if (lastDevis) {
      const match = lastDevis.devisNumber.match(/DV-\d{4}-(\d+)/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }

    const devisNumber = generateDevisNumber(sequence);

    // Create devis
    const newDevis = await prisma.devis.create({
      data: {
        devisNumber,
        clientId,
        vehicleId,
        estimateurId: tenant.userId,
        notes: notes || null,
        status: 'BROUILLON',
        totalHT: 0,
        totalTPS: 0,
        totalTVQ: 0,
        totalTTC: 0,
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
        action: "CREATE",
        entityType: "Devis",
        entityId: newDevis.id,
        details: JSON.stringify({
          devisNumber: newDevis.devisNumber,
          client: `${client.firstName} ${client.lastName}`,
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: newDevis.id,
        devisNumber: newDevis.devisNumber,
        status: newDevis.status,
        client: {
          id: newDevis.client.id,
          fullName: `${newDevis.client.firstName} ${newDevis.client.lastName}`,
          phone: newDevis.client.phone,
        },
        vehicle: {
          id: newDevis.vehicle.id,
          fullName: `${newDevis.vehicle.year} ${newDevis.vehicle.make} ${newDevis.vehicle.model}`,
          licensePlate: newDevis.vehicle.licensePlate,
        },
        estimateur: {
          id: newDevis.estimateur.id,
          fullName: `${newDevis.estimateur.firstName} ${newDevis.estimateur.lastName}`,
        },
        totalHT: 0,
        totalTPS: 0,
        totalTVQ: 0,
        totalTTC: 0,
        itemCount: 0,
        notes: newDevis.notes,
        createdAt: newDevis.createdAt.toISOString(),
        updatedAt: newDevis.updatedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating devis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du devis" },
      { status: 500 }
    );
  }
}
