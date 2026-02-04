/**
 * Devis Items API Routes
 * POST /api/v1/devis/[id]/items - Add item to devis
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { devisItemSchema, calculateItemTotal, calculateTaxes } from "@/lib/validations/devis";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Recalculate devis totals from items
 */
async function recalculateDevisTotals(devisId: string) {
  const items = await prisma.devisItem.findMany({
    where: { devisId },
    select: { total: true },
  });

  const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
  const { tps, tvq, total } = calculateTaxes(subtotal);

  await prisma.devis.update({
    where: { id: devisId },
    data: {
      totalHT: subtotal,
      totalTPS: tps,
      totalTVQ: tvq,
      totalTTC: total,
    },
  });

  return { subtotal, tps, tvq, total };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Verify devis exists and belongs to tenant
    const devis = await prisma.devis.findFirst({
      where: {
        id,
        estimateur: tenant.where(),
      },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    const items = await prisma.devisItem.findMany({
      where: { devisId: id },
      orderBy: [
        { type: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({
      data: items.map(item => ({
        id: item.id,
        description: item.description,
        type: item.type,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        createdAt: item.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching devis items:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des items" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Verify devis exists and is editable
    const devis = await prisma.devis.findFirst({
      where: {
        id,
        estimateur: tenant.where(),
      },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Only draft devis can have items added
    if (devis.status !== 'BROUILLON') {
      return NextResponse.json(
        { error: "Impossible d'ajouter des items à un devis qui n'est pas en brouillon" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = devisItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { description, type, quantity, unitPrice } = validation.data;
    const itemTotal = calculateItemTotal(quantity, unitPrice);

    // Create item
    const newItem = await prisma.devisItem.create({
      data: {
        devisId: id,
        description,
        type,
        quantity,
        unitPrice,
        total: itemTotal,
      },
    });

    // Recalculate devis totals
    const totals = await recalculateDevisTotals(id);

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "ADD_ITEM",
        entityType: "Devis",
        entityId: id,
        details: JSON.stringify({
          itemId: newItem.id,
          description,
          type,
          quantity,
          unitPrice,
          total: itemTotal,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: newItem.id,
        description: newItem.description,
        type: newItem.type,
        quantity: Number(newItem.quantity),
        unitPrice: Number(newItem.unitPrice),
        total: Number(newItem.total),
        createdAt: newItem.createdAt.toISOString(),
      },
      totals,
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding devis item:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'item" },
      { status: 500 }
    );
  }
}
