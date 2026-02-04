/**
 * Lost Leads Report API
 * GET /api/v1/reports/lost - Get analytics on lost devis
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { z } from "zod";
import { LostReasonLabels } from "@/lib/validations/relance";

const querySchema = z.object({
  period: z.enum(["month", "quarter", "year"]).default("month"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const tenant = await withTenant();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const validation = querySchema.safeParse({
      period: searchParams.get("period") || "month",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { period, startDate: customStart, endDate: customEnd } = validation.data;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    if (customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else {
      switch (period) {
        case "quarter":
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default: // month
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
      }
    }

    // Build tenant where clause
    const tenantWhere = typeof tenant.where === 'function' ? tenant.where() : { tenantId: tenant.tenantId };

    // Fetch lost devis
    const lostDevis = await prisma.devis.findMany({
      where: {
        estimateur: tenantWhere,
        status: "REFUSE",
        lostAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
          },
        },
        estimateur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { lostAt: "desc" },
    });

    // Calculate stats by reason
    const reasonStats: Record<string, { count: number; amount: number }> = {};
    let totalLostAmount = 0;

    for (const devis of lostDevis) {
      const reason = devis.lostReason || "OTHER";
      const amount = Number(devis.totalTTC);

      if (!reasonStats[reason]) {
        reasonStats[reason] = { count: 0, amount: 0 };
      }
      reasonStats[reason].count++;
      reasonStats[reason].amount += amount;
      totalLostAmount += amount;
    }

    // Format reason breakdown
    const byReason = Object.entries(reasonStats).map(([reason, stats]) => ({
      reason,
      count: stats.count,
      amount: stats.amount,
    }));

    // Sort by count descending
    byReason.sort((a, b) => b.count - a.count);

    // Format devis list
    const devisList = lostDevis.map((devis) => ({
      id: devis.id,
      devisNumber: devis.devisNumber,
      client: {
        id: devis.client.id,
        fullName: `${devis.client.firstName} ${devis.client.lastName}`,
      },
      vehicle: {
        id: devis.vehicle.id,
        fullName: `${devis.vehicle.year} ${devis.vehicle.make} ${devis.vehicle.model}`,
      },
      estimateur: {
        id: devis.estimateur.id,
        fullName: `${devis.estimateur.firstName} ${devis.estimateur.lastName}`,
      },
      totalTTC: Number(devis.totalTTC),
      lostReason: devis.lostReason,
      lostReasonLabel: devis.lostReason 
        ? LostReasonLabels[devis.lostReason as keyof typeof LostReasonLabels] 
        : null,
      lostNotes: devis.lostNotes,
      lostAt: devis.lostAt?.toISOString() ?? null,
      createdAt: devis.createdAt.toISOString(),
    }));

    return NextResponse.json({
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        label: period,
      },
      summary: {
        count: lostDevis.length,
        totalAmount: totalLostAmount,
      },
      byReason,
      devis: devisList,
    });
  } catch (error) {
    console.error("Error fetching lost report:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du rapport" },
      { status: 500 }
    );
  }
}
