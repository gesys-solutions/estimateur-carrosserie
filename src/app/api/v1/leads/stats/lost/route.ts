/**
 * Lost Leads Statistics API
 * GET /api/v1/leads/stats/lost - Get statistics about lost leads
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { LostReasonLabels, type LostReasonType } from "@/lib/validations/relance";
import { subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const tenant = await withTenant();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    // Calculate date range based on period
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (period) {
      case "week":
        from = subDays(now, 7);
        break;
      case "month":
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case "quarter":
        from = subMonths(now, 3);
        break;
      case "year":
        from = startOfYear(now);
        to = endOfYear(now);
        break;
      default:
        from = startOfMonth(now);
        to = endOfMonth(now);
    }

    // Get all lost devis (REFUSE status with lostReason)
    const lostDevis = await prisma.devis.findMany({
      where: {
        estimateur: { tenantId: tenant.tenantId },
        status: "REFUSE",
        lostAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        id: true,
        lostReason: true,
        totalTTC: true,
        lostAt: true,
        estimateur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Group by reason
    const byReasonMap = new Map<string, { count: number; totalAmount: number }>();
    let totalCount = 0;
    let totalAmount = 0;

    for (const devis of lostDevis) {
      const reason = devis.lostReason || "OTHER";
      const amount = Number(devis.totalTTC);
      
      totalCount++;
      totalAmount += amount;

      const existing = byReasonMap.get(reason) || { count: 0, totalAmount: 0 };
      byReasonMap.set(reason, {
        count: existing.count + 1,
        totalAmount: existing.totalAmount + amount,
      });
    }

    // Format response
    const byReason = Array.from(byReasonMap.entries())
      .map(([reason, stats]) => ({
        reason,
        reasonLabel: LostReasonLabels[reason as LostReasonType] || reason,
        count: stats.count,
        percentage: totalCount > 0 ? Math.round((stats.count / totalCount) * 100) : 0,
        totalAmount: Math.round(stats.totalAmount * 100) / 100,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      byReason,
      total: {
        count: totalCount,
        amount: Math.round(totalAmount * 100) / 100,
      },
      period: {
        name: period,
        from: from.toISOString(),
        to: to.toISOString(),
        days: Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)),
      },
    });
  } catch (error) {
    console.error("Lost leads stats error:", error);
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
