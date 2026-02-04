/**
 * Dashboard Pending Leads API
 * GET /api/v1/dashboard/leads
 * 
 * Returns quotes in BROUILLON or ENVOYE status (leads to follow up)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { differenceInDays } from "date-fns";

export async function GET() {
  try {
    const tenant = await withTenant();
    const now = new Date();

    // Get all pending leads
    const leads = await prisma.devis.findMany({
      where: {
        estimateur: { tenantId: tenant.tenantId },
        status: { in: ["BROUILLON", "ENVOYE"] }
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true
          }
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        },
        estimateur: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        relances: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            type: true,
            createdAt: true,
            nextFollowUp: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedLeads = leads.map(l => {
      const daysSinceCreation = differenceInDays(now, l.createdAt);
      const lastRelance = l.relances[0];
      const needsFollowUp = !lastRelance || 
        (lastRelance.nextFollowUp && new Date(lastRelance.nextFollowUp) <= now);

      return {
        id: l.id,
        devisNumber: l.devisNumber,
        status: l.status,
        client: {
          id: l.client.id,
          name: `${l.client.firstName} ${l.client.lastName}`,
          phone: l.client.phone,
          email: l.client.email
        },
        vehicle: {
          id: l.vehicle.id,
          description: `${l.vehicle.make} ${l.vehicle.model} ${l.vehicle.year}`
        },
        estimateur: {
          id: l.estimateur.id,
          name: `${l.estimateur.firstName} ${l.estimateur.lastName}`
        },
        amount: Number(l.totalTTC),
        createdAt: l.createdAt,
        daysSinceCreation,
        lastRelance: lastRelance ? {
          type: lastRelance.type,
          date: lastRelance.createdAt,
          nextFollowUp: lastRelance.nextFollowUp
        } : null,
        needsFollowUp,
        priority: (daysSinceCreation > 7 ? "high" : daysSinceCreation > 3 ? "medium" : "low") as "high" | "medium" | "low"
      };
    });

    // Sort by priority (high first)
    const priorityOrder: Record<"high" | "medium" | "low", number> = { high: 0, medium: 1, low: 2 };
    formattedLeads.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return NextResponse.json({
      items: formattedLeads,
      count: formattedLeads.length,
      needsFollowUpCount: formattedLeads.filter(l => l.needsFollowUp).length,
      byStatus: {
        brouillon: formattedLeads.filter(l => l.status === "BROUILLON").length,
        envoye: formattedLeads.filter(l => l.status === "ENVOYE").length
      }
    });
  } catch (error) {
    console.error("Dashboard leads error:", error);
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
