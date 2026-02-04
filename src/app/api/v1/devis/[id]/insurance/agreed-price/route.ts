/**
 * Agreed Price API Route
 * POST /api/v1/devis/[id]/insurance/agreed-price - Set agreed price after negotiation
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { agreedPriceSchema } from "@/lib/validations/assurance";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const tenant = await withTenant();
    const { id: devisId } = await context.params;
    
    // Check if devis exists with reclamation
    const devis = await prisma.devis.findFirst({
      where: { id: devisId },
      include: {
        client: true,
        reclamation: {
          include: {
            assurance: true,
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
      return NextResponse.json(
        { error: "Ce devis n'a pas de réclamation associée" },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = agreedPriceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { agreedPrice, notes } = validation.data;
    const previousPrice = devis.reclamation.agreedPrice ? Number(devis.reclamation.agreedPrice) : null;
    const originalTotal = Number(devis.totalTTC);

    // Update reclamation with agreed price and set status to approved
    const updated = await prisma.reclamation.update({
      where: { id: devis.reclamation.id },
      data: {
        agreedPrice,
        agreedAt: new Date(),
        status: 'APPROUVEE',
      },
      include: {
        assurance: true,
      },
    });

    // Add automatic negotiation note
    const noteContent = notes 
      ? `Prix convenu enregistré: ${agreedPrice.toFixed(2)} $ (original: ${originalTotal.toFixed(2)} $). ${notes}`
      : `Prix convenu enregistré: ${agreedPrice.toFixed(2)} $ (original: ${originalTotal.toFixed(2)} $)`;
    
    if (previousPrice !== null && previousPrice !== agreedPrice) {
      await prisma.negotiationNote.create({
        data: {
          reclamationId: updated.id,
          content: `Prix convenu modifié de ${previousPrice.toFixed(2)} $ à ${agreedPrice.toFixed(2)} $${notes ? `. ${notes}` : ''}`,
          createdById: tenant.userId,
        },
      });
    } else {
      await prisma.negotiationNote.create({
        data: {
          reclamationId: updated.id,
          content: noteContent,
          createdById: tenant.userId,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "SET_AGREED_PRICE",
        entityType: "Reclamation",
        entityId: updated.id,
        details: JSON.stringify({
          devisId,
          devisNumber: devis.devisNumber,
          originalTotal,
          agreedPrice,
          previousPrice,
          difference: agreedPrice - originalTotal,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        devisId: updated.devisId,
        agreedPrice: Number(updated.agreedPrice),
        agreedAt: updated.agreedAt?.toISOString(),
        originalTotal,
        difference: agreedPrice - originalTotal,
        percentDifference: originalTotal > 0 ? ((agreedPrice - originalTotal) / originalTotal * 100).toFixed(2) : 0,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("Error setting agreed price:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du prix convenu" },
      { status: 500 }
    );
  }
}
