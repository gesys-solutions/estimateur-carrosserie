/**
 * Single Assurance API Routes
 * GET /api/v1/assurances/[id] - Get insurance company details
 * PATCH /api/v1/assurances/[id] - Update insurance company
 * DELETE /api/v1/assurances/[id] - Deactivate insurance company (soft delete)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { assuranceUpdateSchema } from "@/lib/validations/assurance";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await withTenant();
    const { id } = await context.params;
    
    const assurance = await prisma.assurance.findFirst({
      where: {
        id,
        ...tenant.where(),
      },
      include: {
        _count: {
          select: { reclamations: true },
        },
        reclamations: {
          include: {
            devis: {
              include: {
                client: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!assurance) {
      return NextResponse.json(
        { error: "Compagnie d'assurance introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: assurance.id,
        name: assurance.name,
        contactName: assurance.contactName,
        contactEmail: assurance.contactEmail,
        contactPhone: assurance.contactPhone,
        address: assurance.address,
        notes: assurance.notes,
        isActive: assurance.isActive,
        reclamationCount: assurance._count.reclamations,
        recentReclamations: assurance.reclamations.map((r) => ({
          id: r.id,
          devisId: r.devisId,
          devisNumber: r.devis.devisNumber,
          clientName: `${r.devis.client.firstName} ${r.devis.client.lastName}`,
          claimNumber: r.claimNumber,
          status: r.status,
          agreedPrice: r.agreedPrice ? Number(r.agreedPrice) : null,
          createdAt: r.createdAt.toISOString(),
        })),
        createdAt: assurance.createdAt.toISOString(),
        updatedAt: assurance.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching assurance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'assurance" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await withTenant();
    const { id } = await context.params;
    
    // Check if assurance exists and belongs to tenant
    const existing = await prisma.assurance.findFirst({
      where: {
        id,
        ...tenant.where(),
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Compagnie d'assurance introuvable" },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = assuranceUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update insurance company
    const updated = await prisma.assurance.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        contactName: data.contactName !== undefined ? (data.contactName || null) : undefined,
        contactEmail: data.contactEmail !== undefined ? (data.contactEmail || null) : undefined,
        contactPhone: data.contactPhone !== undefined ? (data.contactPhone || null) : undefined,
        address: data.address !== undefined ? (data.address || null) : undefined,
        notes: data.notes !== undefined ? (data.notes || null) : undefined,
      },
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
        action: "UPDATE",
        entityType: "Assurance",
        entityId: id,
        details: JSON.stringify({
          changes: data,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        name: updated.name,
        contactName: updated.contactName,
        contactEmail: updated.contactEmail,
        contactPhone: updated.contactPhone,
        address: updated.address,
        notes: updated.notes,
        isActive: updated.isActive,
        reclamationCount: updated._count.reclamations,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating assurance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'assurance" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await withTenant();
    const { id } = await context.params;
    
    // Check if assurance exists and belongs to tenant
    const existing = await prisma.assurance.findFirst({
      where: {
        id,
        ...tenant.where(),
      },
      include: {
        _count: {
          select: { reclamations: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Compagnie d'assurance introuvable" },
        { status: 404 }
      );
    }

    // Soft delete (deactivate)
    await prisma.assurance.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "DEACTIVATE",
        entityType: "Assurance",
        entityId: id,
        details: JSON.stringify({
          name: existing.name,
          reclamationCount: existing._count.reclamations,
        }),
      },
    });

    return NextResponse.json({
      message: "Compagnie d'assurance désactivée",
    });
  } catch (error) {
    console.error("Error deactivating assurance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désactivation de l'assurance" },
      { status: 500 }
    );
  }
}
