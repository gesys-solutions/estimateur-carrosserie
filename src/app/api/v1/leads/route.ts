/**
 * Leads API Routes
 * GET /api/v1/leads - List all leads (unconverted devis)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { toFollowUpQuerySchema, LostReasonLabels } from "@/lib/validations/relance";
import { differenceInDays } from "date-fns";

/**
 * GET /api/v1/leads
 * List leads (devis BROUILLON/ENVOYE/EN_NEGOCIATION that need follow-up)
 */
export async function GET(request: NextRequest) {
  try {
    const tenant = await withTenant();
    const now = new Date();
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const queryParams = {
      daysThreshold: searchParams.get("minDays") || searchParams.get("daysThreshold"),
      estimateurId: searchParams.get("estimateurId"),
      status: searchParams.get("status"),
      priority: searchParams.get("priority"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    };

    const parsed = toFollowUpQuerySchema.safeParse({
      daysThreshold: queryParams.daysThreshold ? Number(queryParams.daysThreshold) : undefined,
      estimateurId: queryParams.estimateurId || undefined,
      status: queryParams.status || undefined,
      page: queryParams.page ? Number(queryParams.page) : 1,
      limit: queryParams.limit ? Number(queryParams.limit) : 50,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { daysThreshold, estimateurId, status, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: Record<string, unknown> = {
      estimateur: { tenantId: tenant.tenantId },
      status: status 
        ? status 
        : { in: ["BROUILLON", "ENVOYE", "EN_NEGOCIATION"] },
    };

    if (estimateurId) {
      whereClause.estimateurId = estimateurId;
    }

    // Query leads
    const [leads, totalCount] = await Promise.all([
      prisma.devis.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
            },
          },
          estimateur: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          relances: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              type: true,
              notes: true,
              createdAt: true,
              nextFollowUp: true,
            },
          },
        },
        orderBy: [
          { createdAt: "asc" }, // Oldest first
        ],
        skip,
        take: limit,
      }),
      prisma.devis.count({ where: whereClause }),
    ]);

    // Process leads with age calculation and priority
    const formattedLeads = leads.map((l) => {
      const daysSinceCreation = differenceInDays(now, l.createdAt);
      const lastRelance = l.relances[0];
      
      // Calculate if follow-up is needed
      let needsFollowUp = false;
      if (!lastRelance) {
        needsFollowUp = daysSinceCreation >= daysThreshold;
      } else if (lastRelance.nextFollowUp) {
        needsFollowUp = new Date(lastRelance.nextFollowUp) <= now;
      } else {
        const daysSinceLastRelance = differenceInDays(now, lastRelance.createdAt);
        needsFollowUp = daysSinceLastRelance >= daysThreshold;
      }

      // Determine priority
      let priority: "high" | "medium" | "low" = "low";
      if (daysSinceCreation > 14) {
        priority = "high";
      } else if (daysSinceCreation > 7) {
        priority = "medium";
      }

      return {
        id: l.id,
        devisNumber: l.devisNumber,
        status: l.status,
        client: {
          id: l.client.id,
          name: `${l.client.firstName} ${l.client.lastName}`,
          phone: l.client.phone,
          email: l.client.email,
        },
        vehicle: {
          id: l.vehicle.id,
          description: `${l.vehicle.make} ${l.vehicle.model} ${l.vehicle.year}`,
          licensePlate: l.vehicle.licensePlate,
        },
        estimateur: {
          id: l.estimateur.id,
          name: `${l.estimateur.firstName} ${l.estimateur.lastName}`,
        },
        amount: Number(l.totalTTC),
        createdAt: l.createdAt.toISOString(),
        daysSinceCreation,
        lastRelance: lastRelance
          ? {
              id: lastRelance.id,
              type: lastRelance.type,
              notes: lastRelance.notes,
              date: lastRelance.createdAt.toISOString(),
              nextFollowUp: lastRelance.nextFollowUp?.toISOString() ?? null,
            }
          : null,
        needsFollowUp,
        priority,
        lostReason: l.lostReason,
        lostAt: l.lostAt?.toISOString() ?? null,
        lostNotes: l.lostNotes,
      };
    });

    // Apply priority filter if specified
    const priorityParam = queryParams.priority as "high" | "medium" | "low" | null;
    const filteredLeads = priorityParam
      ? formattedLeads.filter((l) => l.priority === priorityParam)
      : formattedLeads;

    // Sort by priority (high first) then by age (oldest first)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    filteredLeads.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.daysSinceCreation - a.daysSinceCreation;
    });

    // Calculate stats
    const needsFollowUpCount = filteredLeads.filter((l) => l.needsFollowUp).length;
    const byStatus = {
      brouillon: filteredLeads.filter((l) => l.status === "BROUILLON").length,
      envoye: filteredLeads.filter((l) => l.status === "ENVOYE").length,
      enNegociation: filteredLeads.filter((l) => l.status === "EN_NEGOCIATION").length,
    };

    return NextResponse.json({
      items: filteredLeads,
      count: filteredLeads.length,
      totalCount,
      needsFollowUpCount,
      byStatus,
      pagination: {
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Leads API error:", error);
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
