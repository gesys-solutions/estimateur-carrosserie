/**
 * Dashboard My KPIs API
 * GET /api/v1/dashboard/my-kpis
 * 
 * Returns personal KPIs for the current user
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { startOfDay, startOfWeek, startOfMonth, subMonths } from "date-fns";

export async function GET() {
  try {
    const tenant = await withTenant();
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));

    // Get current user's KPIs
    const [
      todayCreated,
      weekCreated,
      monthCreated,
      monthAccepted,
      lastMonthAccepted,
      totalCreated,
      totalAccepted
    ] = await Promise.all([
      // Devis created today
      prisma.devis.count({
        where: {
          estimateurId: tenant.userId,
          createdAt: { gte: todayStart }
        }
      }),
      
      // Devis created this week
      prisma.devis.count({
        where: {
          estimateurId: tenant.userId,
          createdAt: { gte: weekStart }
        }
      }),
      
      // Devis created this month
      prisma.devis.count({
        where: {
          estimateurId: tenant.userId,
          createdAt: { gte: monthStart }
        }
      }),
      
      // Accepted this month (with amount)
      prisma.devis.aggregate({
        where: {
          estimateurId: tenant.userId,
          status: "ACCEPTE",
          updatedAt: { gte: monthStart }
        },
        _count: { id: true },
        _sum: { totalTTC: true }
      }),
      
      // Accepted last month (for comparison)
      prisma.devis.aggregate({
        where: {
          estimateurId: tenant.userId,
          status: "ACCEPTE",
          updatedAt: { gte: lastMonthStart, lt: monthStart }
        },
        _count: { id: true },
        _sum: { totalTTC: true }
      }),
      
      // Total created all time
      prisma.devis.count({
        where: { estimateurId: tenant.userId }
      }),
      
      // Total accepted all time
      prisma.devis.count({
        where: {
          estimateurId: tenant.userId,
          status: "ACCEPTE"
        }
      })
    ]);

    // Calculate conversion rate
    const conversionRate = totalCreated > 0 
      ? Math.round((totalAccepted / totalCreated) * 100)
      : 0;

    // Calculate month vs last month trend
    const thisMonthAmount = Number(monthAccepted._sum.totalTTC) || 0;
    const lastMonthAmount = Number(lastMonthAccepted._sum.totalTTC) || 0;
    const monthTrend = lastMonthAmount > 0
      ? Math.round(((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100)
      : thisMonthAmount > 0 ? 100 : 0;

    return NextResponse.json({
      created: {
        today: todayCreated,
        week: weekCreated,
        month: monthCreated,
        total: totalCreated
      },
      accepted: {
        month: monthAccepted._count.id || 0,
        total: totalAccepted
      },
      amount: {
        month: thisMonthAmount,
        lastMonth: lastMonthAmount,
        trend: monthTrend
      },
      conversionRate
    });
  } catch (error) {
    console.error("Dashboard my-kpis error:", error);
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
