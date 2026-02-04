/**
 * Relances API Routes for a specific Devis
 * GET /api/v1/devis/[id]/relances - List relances for a devis
 * POST /api/v1/devis/[id]/relances - Create a new relance
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { createRelanceSchema } from "@/lib/validations/relance";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/devis/[id]/relances
 * List all relances for a devis
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id: devisId } = await params;

    // Verify devis belongs to tenant
    const devis = await prisma.devis.findFirst({
      where: {
        id: devisId,
        estimateur: tenant.where(),
      },
      select: { id: true },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Fetch relances
    const relances = await prisma.relance.findMany({
      where: { devisId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = relances.map((r) => ({
      id: r.id,
      type: r.type,
      notes: r.notes,
      outcome: r.outcome,
      scheduledAt: r.scheduledAt?.toISOString() ?? null,
      completedAt: r.completedAt?.toISOString() ?? null,
      nextFollowUp: r.nextFollowUp?.toISOString() ?? null,
      createdBy: {
        id: r.createdBy.id,
        fullName: `${r.createdBy.firstName} ${r.createdBy.lastName}`,
      },
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching relances:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des relances" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/devis/[id]/relances
 * Create a new relance for a devis
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const tenant = await withTenant();
    const { id: devisId } = await params;

    // Verify devis belongs to tenant and is in valid status
    const devis = await prisma.devis.findFirst({
      where: {
        id: devisId,
        estimateur: tenant.where(),
      },
      select: { id: true, devisNumber: true, status: true },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validation = createRelanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { type, notes, outcome, scheduledAt, nextFollowUp } = validation.data;

    // Create relance
    const relance = await prisma.relance.create({
      data: {
        devisId,
        type,
        notes,
        outcome: outcome ?? null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        createdById: tenant.userId,
      },
      include: {
        createdBy: {
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
        entityType: "Relance",
        entityId: relance.id,
        details: JSON.stringify({
          devisId,
          devisNumber: devis.devisNumber,
          type,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: relance.id,
        type: relance.type,
        notes: relance.notes,
        outcome: relance.outcome,
        scheduledAt: relance.scheduledAt?.toISOString() ?? null,
        completedAt: relance.completedAt?.toISOString() ?? null,
        nextFollowUp: relance.nextFollowUp?.toISOString() ?? null,
        createdBy: {
          id: relance.createdBy.id,
          fullName: `${relance.createdBy.firstName} ${relance.createdBy.lastName}`,
        },
        createdAt: relance.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating relance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la relance" },
      { status: 500 }
    );
  }
}
