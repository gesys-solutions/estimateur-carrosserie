/**
 * Clients API Routes
 * GET /api/v1/clients - List clients for current tenant (with search/pagination)
 * POST /api/v1/clients - Create a new client
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { clientSchema, clientSearchSchema } from "@/lib/validations/client";

export async function GET(request: NextRequest) {
  try {
    const tenant = await withTenant();
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const params = clientSearchSchema.safeParse({
      q: searchParams.get("q") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      sortBy: searchParams.get("sortBy") || "lastName",
      sortOrder: searchParams.get("sortOrder") || "asc",
    });

    if (!params.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: params.error.flatten() },
        { status: 400 }
      );
    }

    const { q, page, limit, sortBy, sortOrder } = params.data;
    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions = q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
            {
              vehicles: {
                some: {
                  licensePlate: { contains: q },
                },
              },
            },
          ],
        }
      : {};

    // Fetch clients with vehicle count
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: {
          ...tenant.where(),
          ...searchConditions,
        },
        include: {
          _count: {
            select: { vehicles: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.client.count({
        where: {
          ...tenant.where(),
          ...searchConditions,
        },
      }),
    ]);

    // Transform for response
    const data = clients.map((client) => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      fullName: `${client.firstName} ${client.lastName}`,
      email: client.email,
      phone: client.phone,
      city: client.city,
      vehicleCount: client._count.vehicles,
      createdAt: client.createdAt.toISOString(),
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
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await withTenant();
    
    const body = await request.json();
    
    // Validate input
    const validation = clientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create client
    const newClient = await prisma.client.create({
      data: tenant.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
      }),
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
        action: "CREATE",
        entityType: "Client",
        entityId: newClient.id,
        details: JSON.stringify({
          name: `${newClient.firstName} ${newClient.lastName}`,
          phone: newClient.phone,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: newClient.id,
        firstName: newClient.firstName,
        lastName: newClient.lastName,
        fullName: `${newClient.firstName} ${newClient.lastName}`,
        email: newClient.email,
        phone: newClient.phone,
        address: newClient.address,
        city: newClient.city,
        postalCode: newClient.postalCode,
        vehicleCount: newClient._count.vehicles,
        createdAt: newClient.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du client" },
      { status: 500 }
    );
  }
}
