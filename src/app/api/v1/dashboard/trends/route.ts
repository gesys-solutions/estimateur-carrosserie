/**
 * Dashboard Trends API
 * GET /api/v1/dashboard/trends
 * 
 * Returns sales data over time for charts
 * Query params:
 * - days: number of days (default: 7, max: 90)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { subDays, startOfDay, format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";

export async function GET(request: NextRequest) {
  try {
    const tenant = await withTenant();
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const days = Math.min(Math.max(parseInt(daysParam || "7"), 1), 90);
    
    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, days - 1);

    // Get all accepted quotes in the date range
    const quotes = await prisma.devis.findMany({
      where: {
        estimateur: { tenantId: tenant.tenantId },
        status: "ACCEPTE",
        updatedAt: { gte: startDate }
      },
      select: {
        id: true,
        totalTTC: true,
        updatedAt: true
      }
    });

    // Generate all dates in range
    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Group by date
    const dailyData = allDates.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayQuotes = quotes.filter(q => 
        format(q.updatedAt, "yyyy-MM-dd") === dateStr
      );
      
      return {
        date: dateStr,
        label: format(date, "EEE d MMM", { locale: fr }),
        amount: dayQuotes.reduce((sum, q) => sum + Number(q.totalTTC), 0),
        count: dayQuotes.length
      };
    });

    // Calculate summary stats
    const totalAmount = dailyData.reduce((sum, d) => sum + d.amount, 0);
    const totalCount = dailyData.reduce((sum, d) => sum + d.count, 0);
    const avgPerDay = dailyData.length > 0 ? totalAmount / dailyData.length : 0;

    return NextResponse.json({
      data: dailyData,
      summary: {
        totalAmount,
        totalCount,
        avgPerDay: Math.round(avgPerDay * 100) / 100,
        days
      }
    });
  } catch (error) {
    console.error("Dashboard trends error:", error);
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
