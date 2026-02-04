/**
 * Dashboard Production API
 * GET /api/v1/dashboard/production
 * 
 * Returns quotes currently in production (EN_REPARATION status)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { differenceInDays } from "date-fns";

export async function GET() {
  try {
    const tenant = await withTenant();
    const now = new Date();

    // Get all quotes in repair
    const production = await prisma.devis.findMany({
      where: {
        estimateur: { tenantId: tenant.tenantId },
        status: "EN_REPARATION"
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
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
      orderBy: { updatedAt: "asc" }
    });

    const formattedProduction = production.map(p => {
      const daysInShop = differenceInDays(now, p.updatedAt);
      return {
        id: p.id,
        devisNumber: p.devisNumber,
        client: {
          id: p.client.id,
          name: `${p.client.firstName} ${p.client.lastName}`,
          phone: p.client.phone
        },
        vehicle: {
          id: p.vehicle.id,
          description: `${p.vehicle.make} ${p.vehicle.model} ${p.vehicle.year}`,
          licensePlate: p.vehicle.licensePlate
        },
        estimateur: {
          id: p.estimateur.id,
          name: `${p.estimateur.firstName} ${p.estimateur.lastName}`
        },
        amount: Number(p.totalTTC),
        startedAt: p.updatedAt,
        daysInShop,
        isOverdue: daysInShop > 7 // Alert if > 7 days
      };
    });

    return NextResponse.json({
      items: formattedProduction,
      count: formattedProduction.length,
      overdueCount: formattedProduction.filter(p => p.isOverdue).length
    });
  } catch (error) {
    console.error("Dashboard production error:", error);
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
