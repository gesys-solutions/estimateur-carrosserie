/**
 * Single Devis Item API Routes
 * PATCH /api/v1/devis/[id]/items/[itemId] - Update item
 * DELETE /api/v1/devis/[id]/items/[itemId] - Remove item
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { devisItemSchema, calculateItemTotal, calculateTaxes } from "@/lib/validations/devis";

type RouteParams = { params: Promise<{ id: string; itemId: string }> };

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

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tenant = await withTenant();
    const { id, itemId } = await params;

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

    // Only draft devis can have items modified
    if (devis.status !== 'BROUILLON') {
      return NextResponse.json(
        { error: "Impossible de modifier les items d'un devis qui n'est pas en brouillon" },
        { status: 400 }
      );
    }

    // Verify item exists and belongs to devis
    const existingItem = await prisma.devisItem.findFirst({
      where: {
        id: itemId,
        devisId: id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item non trouvé" },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate input (partial)
    const validation = devisItemSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { description, type, quantity, unitPrice } = validation.data;

    // Calculate new total if quantity or price changed
    const newQuantity = quantity ?? Number(existingItem.quantity);
    const newUnitPrice = unitPrice ?? Number(existingItem.unitPrice);
    const itemTotal = calculateItemTotal(newQuantity, newUnitPrice);

    // Update item
    const updatedItem = await prisma.devisItem.update({
      where: { id: itemId },
      data: {
        description: description ?? existingItem.description,
        type: type ?? existingItem.type,
        quantity: newQuantity,
        unitPrice: newUnitPrice,
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
        action: "UPDATE_ITEM",
        entityType: "Devis",
        entityId: id,
        details: JSON.stringify({
          itemId,
          changes: validation.data,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: updatedItem.id,
        description: updatedItem.description,
        type: updatedItem.type,
        quantity: Number(updatedItem.quantity),
        unitPrice: Number(updatedItem.unitPrice),
        total: Number(updatedItem.total),
        createdAt: updatedItem.createdAt.toISOString(),
      },
      totals,
    });
  } catch (error) {
    console.error("Error updating devis item:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tenant = await withTenant();
    const { id, itemId } = await params;

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

    // Only draft devis can have items removed
    if (devis.status !== 'BROUILLON') {
      return NextResponse.json(
        { error: "Impossible de supprimer les items d'un devis qui n'est pas en brouillon" },
        { status: 400 }
      );
    }

    // Verify item exists and belongs to devis
    const existingItem = await prisma.devisItem.findFirst({
      where: {
        id: itemId,
        devisId: id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item non trouvé" },
        { status: 404 }
      );
    }

    // Delete item
    await prisma.devisItem.delete({
      where: { id: itemId },
    });

    // Recalculate devis totals
    const totals = await recalculateDevisTotals(id);

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.tenantId,
        userId: tenant.userId,
        action: "DELETE_ITEM",
        entityType: "Devis",
        entityId: id,
        details: JSON.stringify({
          itemId,
          description: existingItem.description,
        }),
      },
    });

    return NextResponse.json({ success: true, totals });
  } catch (error) {
    console.error("Error deleting devis item:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'item" },
      { status: 500 }
    );
  }
}
