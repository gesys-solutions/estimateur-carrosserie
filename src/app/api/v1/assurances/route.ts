/**
 * Assurances API Routes
 * GET /api/v1/assurances - List insurance companies for current tenant
 * POST /api/v1/assurances - Create a new insurance company
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { assuranceSchema, assuranceSearchSchema } from "@/lib/validations/assurance";

export async function GET(request: NextRequest) {
  try {
    const tenant = await withTenant();
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const params = assuranceSearchSchema.safeParse({
      q: searchParams.get("q") || undefined,
      includeInactive: searchParams.get("includeInactive") === "true",
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      sortBy: searchParams.get("sortBy") || "name",
      sortOrder: searchParams.get("sortOrder") || "asc",
    });

    if (!params.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: params.error.flatten() },
        { status: 400 }
      );
    }

    const { q, includeInactive, page, limit, sortBy, sortOrder } = params.data;
    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions = q
      ? {
          OR: [
            { name: { contains: q } },
            { contactName: { contains: q } },
            { contactEmail: { contains: q } },
          ],
        }
      : {};
    
    const activeFilter = includeInactive ? {} : { isActive: true };

    // Fetch insurance companies with reclamation count
    const [assurances, total] = await Promise.all([
      prisma.assurance.findMany({
        where: {
          ...tenant.where(),
          ...searchConditions,
          ...activeFilter,
        },
        include: {
          _count: {
            select: { reclamations: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.assurance.count({
        where: {
          ...tenant.where(),
          ...searchConditions,
          ...activeFilter,
        },
      }),
    ]);

    // Transform for response
    const data = assurances.map((assurance) => ({
      id: assurance.id,
      name: assurance.name,
      contactName: assurance.contactName,
      contactEmail: assurance.contactEmail,
      contactPhone: assurance.contactPhone,
      address: assurance.address,
      notes: assurance.notes,
      isActive: assurance.isActive,
      reclamationCount: assurance._count.reclamations,
      createdAt: assurance.createdAt.toISOString(),
      updatedAt: assurance.updatedAt.toISOString(),
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
    console.error("Error fetching assurances:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des assurances" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await withTenant();
    
    const body = await request.json();
    
    // Validate input
    const validation = assuranceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create insurance company
    const newAssurance = await prisma.assurance.create({
      data: tenant.create({
        name: data.name,
        contactName: data.contactName || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        address: data.address || null,
        notes: data.notes || null,
      }),
      include: {
        _count: {
          select: { reclamations: true },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "CREATE",
        entityType: "Assurance",
        entityId: newAssurance.id,
        details: JSON.stringify({
          name: newAssurance.name,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: newAssurance.id,
        name: newAssurance.name,
        contactName: newAssurance.contactName,
        contactEmail: newAssurance.contactEmail,
        contactPhone: newAssurance.contactPhone,
        address: newAssurance.address,
        notes: newAssurance.notes,
        isActive: newAssurance.isActive,
        reclamationCount: newAssurance._count.reclamations,
        createdAt: newAssurance.createdAt.toISOString(),
        updatedAt: newAssurance.updatedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating assurance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'assurance" },
      { status: 500 }
    );
  }
}
