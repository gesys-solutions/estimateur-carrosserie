/**
 * Devis Insurance (Reclamation) API Routes
 * GET /api/v1/devis/[id]/insurance - Get insurance info for a quote
 * POST /api/v1/devis/[id]/insurance - Create insurance claim for a quote
 * PATCH /api/v1/devis/[id]/insurance - Update insurance claim
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { reclamationCreateSchema, reclamationUpdateSchema } from "@/lib/validations/assurance";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await withTenant();
    const { id: devisId } = await context.params;
    
    // Check if devis exists and get its client's tenant
    const devis = await prisma.devis.findFirst({
      where: { id: devisId },
      include: {
        client: true,
        reclamation: {
          include: {
            assurance: true,
            negotiationNotes: {
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
            },
          },
        },
      },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis introuvable" },
        { status: 404 }
      );
    }

    // Verify tenant access through client
    if (devis.client.tenantId !== tenant.tenantId) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    if (!devis.reclamation) {
      return NextResponse.json({
        data: null,
      });
    }

    const r = devis.reclamation;
    return NextResponse.json({
      data: {
        id: r.id,
        devisId: r.devisId,
        assurance: {
          id: r.assurance.id,
          name: r.assurance.name,
          contactName: r.assurance.contactName,
          contactPhone: r.assurance.contactPhone,
          contactEmail: r.assurance.contactEmail,
        },
        claimNumber: r.claimNumber,
        adjusterName: r.adjusterName,
        adjusterPhone: r.adjusterPhone,
        adjusterEmail: r.adjusterEmail,
        agreedPrice: r.agreedPrice ? Number(r.agreedPrice) : null,
        agreedAt: r.agreedAt?.toISOString() || null,
        status: r.status,
        notes: r.notes,
        negotiationNotes: r.negotiationNotes.map((n) => ({
          id: n.id,
          content: n.content,
          createdBy: {
            id: n.createdBy.id,
            name: `${n.createdBy.firstName} ${n.createdBy.lastName}`,
          },
          createdAt: n.createdAt.toISOString(),
        })),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching devis insurance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des informations d'assurance" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await withTenant();
    const { id: devisId } = await context.params;
    
    // Check if devis exists
    const devis = await prisma.devis.findFirst({
      where: { id: devisId },
      include: {
        client: true,
        reclamation: true,
      },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis introuvable" },
        { status: 404 }
      );
    }

    // Verify tenant access through client
    if (devis.client.tenantId !== tenant.tenantId) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Check if already has a reclamation
    if (devis.reclamation) {
      return NextResponse.json(
        { error: "Ce devis a déjà une réclamation associée. Utilisez PATCH pour modifier." },
        { status: 409 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = reclamationCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify assurance belongs to tenant
    const assurance = await prisma.assurance.findFirst({
      where: {
        id: data.assuranceId,
        ...tenant.where(),
        isActive: true,
      },
    });

    if (!assurance) {
      return NextResponse.json(
        { error: "Compagnie d'assurance introuvable ou inactive" },
        { status: 404 }
      );
    }

    // Create reclamation
    const reclamation = await prisma.reclamation.create({
      data: {
        devisId,
        assuranceId: data.assuranceId,
        claimNumber: data.claimNumber || null,
        adjusterName: data.adjusterName || null,
        adjusterPhone: data.adjusterPhone || null,
        adjusterEmail: data.adjusterEmail || null,
        notes: data.notes || null,
      },
      include: {
        assurance: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "CREATE",
        entityType: "Reclamation",
        entityId: reclamation.id,
        details: JSON.stringify({
          devisId,
          devisNumber: devis.devisNumber,
          assuranceName: assurance.name,
          claimNumber: data.claimNumber,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: reclamation.id,
        devisId: reclamation.devisId,
        assurance: {
          id: reclamation.assurance.id,
          name: reclamation.assurance.name,
        },
        claimNumber: reclamation.claimNumber,
        adjusterName: reclamation.adjusterName,
        adjusterPhone: reclamation.adjusterPhone,
        adjusterEmail: reclamation.adjusterEmail,
        status: reclamation.status,
        notes: reclamation.notes,
        createdAt: reclamation.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating reclamation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réclamation" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await withTenant();
    const { id: devisId } = await context.params;
    
    // Check if devis exists with reclamation
    const devis = await prisma.devis.findFirst({
      where: { id: devisId },
      include: {
        client: true,
        reclamation: true,
      },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis introuvable" },
        { status: 404 }
      );
    }

    // Verify tenant access through client
    if (devis.client.tenantId !== tenant.tenantId) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    if (!devis.reclamation) {
      return NextResponse.json(
        { error: "Ce devis n'a pas de réclamation associée. Utilisez POST pour créer." },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = reclamationUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // If changing assurance, verify it belongs to tenant
    if (data.assuranceId) {
      const assurance = await prisma.assurance.findFirst({
        where: {
          id: data.assuranceId,
          ...tenant.where(),
          isActive: true,
        },
      });

      if (!assurance) {
        return NextResponse.json(
          { error: "Compagnie d'assurance introuvable ou inactive" },
          { status: 404 }
        );
      }
    }

    // Update reclamation
    const updated = await prisma.reclamation.update({
      where: { id: devis.reclamation.id },
      data: {
        assuranceId: data.assuranceId,
        claimNumber: data.claimNumber !== undefined ? (data.claimNumber || null) : undefined,
        adjusterName: data.adjusterName !== undefined ? (data.adjusterName || null) : undefined,
        adjusterPhone: data.adjusterPhone !== undefined ? (data.adjusterPhone || null) : undefined,
        adjusterEmail: data.adjusterEmail !== undefined ? (data.adjusterEmail || null) : undefined,
        status: data.status,
        notes: data.notes !== undefined ? (data.notes || null) : undefined,
      },
      include: {
        assurance: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "UPDATE",
        entityType: "Reclamation",
        entityId: updated.id,
        details: JSON.stringify({
          devisId,
          changes: data,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        devisId: updated.devisId,
        assurance: {
          id: updated.assurance.id,
          name: updated.assurance.name,
        },
        claimNumber: updated.claimNumber,
        adjusterName: updated.adjusterName,
        adjusterPhone: updated.adjusterPhone,
        adjusterEmail: updated.adjusterEmail,
        agreedPrice: updated.agreedPrice ? Number(updated.agreedPrice) : null,
        agreedAt: updated.agreedAt?.toISOString() || null,
        status: updated.status,
        notes: updated.notes,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating reclamation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la réclamation" },
      { status: 500 }
    );
  }
}
