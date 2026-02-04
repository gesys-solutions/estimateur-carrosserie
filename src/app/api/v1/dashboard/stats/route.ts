/**
 * Dashboard Statistics API
 * GET /api/v1/dashboard/stats
 * 
 * Returns global statistics for the dashboard:
 * - Today's quotes count and amount
 * - This week's quotes count and amount
 * - This month's quotes count and amount
 * - Conversion rate
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from "date-fns";

export async function GET() {
  try {
    const tenant = await withTenant();
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const monthStart = startOfMonth(now);

    // Fetch all stats in parallel for better performance
    const [
      todayStats,
      weekStats,
      monthStats,
      yesterdayStats,
      statusCounts,
      inProgressCount,
      pendingLeadsCount
    ] = await Promise.all([
      // Today's approved quotes (ventes du jour)
      prisma.devis.aggregate({
        where: {
          estimateur: { tenantId: tenant.tenantId },
          status: "ACCEPTE",
          updatedAt: { gte: todayStart, lte: todayEnd }
        },
        _count: { id: true },
        _sum: { totalTTC: true }
      }),
      
      // This week's stats
      prisma.devis.aggregate({
        where: {
          estimateur: { tenantId: tenant.tenantId },
          status: "ACCEPTE",
          updatedAt: { gte: weekStart }
        },
        _count: { id: true },
        _sum: { totalTTC: true }
      }),
      
      // This month's stats  
      prisma.devis.aggregate({
        where: {
          estimateur: { tenantId: tenant.tenantId },
          status: "ACCEPTE",
          updatedAt: { gte: monthStart }
        },
        _count: { id: true },
        _sum: { totalTTC: true }
      }),

      // Yesterday's stats for comparison
      prisma.devis.aggregate({
        where: {
          estimateur: { tenantId: tenant.tenantId },
          status: "ACCEPTE",
          updatedAt: { 
            gte: new Date(todayStart.getTime() - 24 * 60 * 60 * 1000),
            lt: todayStart
          }
        },
        _count: { id: true },
        _sum: { totalTTC: true }
      }),

      // Status breakdown
      prisma.devis.groupBy({
        by: ["status"],
        where: {
          estimateur: { tenantId: tenant.tenantId }
        },
        _count: { id: true }
      }),

      // In progress (EN_REPARATION)
      prisma.devis.count({
        where: {
          estimateur: { tenantId: tenant.tenantId },
          status: "EN_REPARATION"
        }
      }),

      // Pending leads (BROUILLON + ENVOYE)
      prisma.devis.count({
        where: {
          estimateur: { tenantId: tenant.tenantId },
          status: { in: ["BROUILLON", "ENVOYE"] }
        }
      })
    ]);

    // Calculate conversion rate (ACCEPTE / total non-draft)
    const totalCreated = statusCounts.reduce((acc, s) => acc + s._count.id, 0);
    const totalAccepted = statusCounts.find(s => s.status === "ACCEPTE")?._count.id || 0;
    const conversionRate = totalCreated > 0 
      ? Math.round((totalAccepted / totalCreated) * 100) 
      : 0;

    // Calculate trends
    const todayAmount = Number(todayStats._sum.totalTTC) || 0;
    const yesterdayAmount = Number(yesterdayStats._sum.totalTTC) || 0;
    const todayVsYesterday = yesterdayAmount > 0 
      ? Math.round(((todayAmount - yesterdayAmount) / yesterdayAmount) * 100)
      : todayAmount > 0 ? 100 : 0;

    return NextResponse.json({
      today: {
        count: todayStats._count.id || 0,
        amount: todayAmount,
        trend: todayVsYesterday
      },
      week: {
        count: weekStats._count.id || 0,
        amount: Number(weekStats._sum.totalTTC) || 0
      },
      month: {
        count: monthStats._count.id || 0,
        amount: Number(monthStats._sum.totalTTC) || 0
      },
      conversionRate,
      statusBreakdown: statusCounts.map(s => ({
        status: s.status,
        count: s._count.id
      })),
      inProgress: inProgressCount,
      pendingLeads: pendingLeadsCount
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
