/**
 * Dashboard Sales API
 * GET /api/v1/dashboard/sales
 * 
 * Returns today's accepted quotes (ventes du jour)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const tenant = await withTenant();
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const sales = await prisma.devis.findMany({
      where: {
        estimateur: { tenantId: tenant.tenantId },
        status: "ACCEPTE",
        updatedAt: { gte: todayStart, lte: todayEnd }
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true
          }
        },
        estimateur: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 50
    });

    const formattedSales = sales.map(s => ({
      id: s.id,
      devisNumber: s.devisNumber,
      client: {
        id: s.client.id,
        name: `${s.client.firstName} ${s.client.lastName}`
      },
      vehicle: {
        id: s.vehicle.id,
        description: `${s.vehicle.make} ${s.vehicle.model} ${s.vehicle.year}`,
        licensePlate: s.vehicle.licensePlate
      },
      estimateur: {
        id: s.estimateur.id,
        name: `${s.estimateur.firstName} ${s.estimateur.lastName}`
      },
      amount: Number(s.totalTTC),
      acceptedAt: s.updatedAt
    }));

    const totalAmount = formattedSales.reduce((sum, s) => sum + s.amount, 0);

    return NextResponse.json({
      sales: formattedSales,
      count: formattedSales.length,
      totalAmount
    });
  } catch (error) {
    console.error("Dashboard sales error:", error);
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
