/**
 * Negotiation Notes API Routes
 * GET /api/v1/devis/[id]/insurance/notes - List negotiation notes
 * POST /api/v1/devis/[id]/insurance/notes - Add a negotiation note
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { negotiationNoteSchema } from "@/lib/validations/assurance";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
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
      return NextResponse.json({
        data: [],
      });
    }

    const notes = await prisma.negotiationNote.findMany({
      where: {
        reclamationId: devis.reclamation.id,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: notes.map((n) => ({
        id: n.id,
        content: n.content,
        createdBy: {
          id: n.createdBy.id,
          name: `${n.createdBy.firstName} ${n.createdBy.lastName}`,
        },
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching negotiation notes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
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
        { error: "Ce devis n'a pas de réclamation associée" },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = negotiationNoteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Create note
    const note = await prisma.negotiationNote.create({
      data: {
        reclamationId: devis.reclamation.id,
        content,
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
        entityType: "NegotiationNote",
        entityId: note.id,
        details: JSON.stringify({
          devisId,
          devisNumber: devis.devisNumber,
          reclamationId: devis.reclamation.id,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: note.id,
        content: note.content,
        createdBy: {
          id: note.createdBy.id,
          name: `${note.createdBy.firstName} ${note.createdBy.lastName}`,
        },
        createdAt: note.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating negotiation note:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la note" },
      { status: 500 }
    );
  }
}
