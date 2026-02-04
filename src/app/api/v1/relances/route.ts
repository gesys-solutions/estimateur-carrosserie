/**
 * Relances List API
 * GET /api/v1/relances - List devis requiring follow-up
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { toFollowUpQuerySchema } from "@/lib/validations/relance";

/**
 * GET /api/v1/relances
 * List devis that need follow-up based on:
 * - Status: BROUILLON, ENVOYE, EN_NEGOCIATION (not closed)
 * - Days since last update > threshold
 */
export async function GET(request: NextRequest) {
  try {
    const tenant = await withTenant();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const validation = toFollowUpQuerySchema.safeParse({
      daysThreshold: searchParams.get("daysThreshold") || 7,
      estimateurId: searchParams.get("estimateurId") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { daysThreshold, estimateurId, status, page, limit } = validation.data;
    const skip = (page - 1) * limit;

    // Calculate threshold date
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    // Build where conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereConditions: any = {
      estimateur: tenant.where(),
      status: status
        ? status
        : { in: ["BROUILLON", "ENVOYE", "EN_NEGOCIATION"] },
      updatedAt: { lt: thresholdDate },
    };

    // Filter by estimateur if manager wants to see specific estimator
    if (estimateurId && tenant.role !== "ESTIMATEUR") {
      whereConditions.estimateurId = estimateurId;
    }

    // Fetch devis requiring follow-up
    const [devisList, total] = await Promise.all([
      prisma.devis.findMany({
        where: whereConditions,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
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
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              type: true,
              notes: true,
              outcome: true,
              nextFollowUp: true,
              createdAt: true,
            },
          },
        },
        orderBy: { updatedAt: "asc" }, // Oldest first (most urgent)
        skip,
        take: limit,
      }),
      prisma.devis.count({ where: whereConditions }),
    ]);

    // Calculate days since last action
    const now = new Date();
    const data = devisList.map((devis) => {
      const lastAction = devis.updatedAt;
      const daysSinceAction = Math.floor(
        (now.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine urgency level
      let urgency: "low" | "medium" | "high" = "low";
      if (daysSinceAction >= 14) {
        urgency = "high";
      } else if (daysSinceAction >= 7) {
        urgency = "medium";
      }

      const lastRelance = devis.relances[0] ?? null;

      return {
        id: devis.id,
        devisNumber: devis.devisNumber,
        status: devis.status,
        client: {
          id: devis.client.id,
          fullName: `${devis.client.firstName} ${devis.client.lastName}`,
          phone: devis.client.phone,
        },
        vehicle: {
          id: devis.vehicle.id,
          fullName: `${devis.vehicle.year} ${devis.vehicle.make} ${devis.vehicle.model}`,
          licensePlate: devis.vehicle.licensePlate,
        },
        estimateur: {
          id: devis.estimateur.id,
          fullName: `${devis.estimateur.firstName} ${devis.estimateur.lastName}`,
        },
        totalTTC: Number(devis.totalTTC),
        daysSinceAction,
        urgency,
        lastAction: lastAction.toISOString(),
        lastRelance: lastRelance
          ? {
              id: lastRelance.id,
              type: lastRelance.type,
              notes: lastRelance.notes,
              outcome: lastRelance.outcome,
              nextFollowUp: lastRelance.nextFollowUp?.toISOString() ?? null,
              createdAt: lastRelance.createdAt.toISOString(),
            }
          : null,
        createdAt: devis.createdAt.toISOString(),
      };
    });

    // Summary stats
    const stats = {
      total,
      high: data.filter((d) => d.urgency === "high").length,
      medium: data.filter((d) => d.urgency === "medium").length,
      low: data.filter((d) => d.urgency === "low").length,
    };

    return NextResponse.json({
      data,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching relances list:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des relances" },
      { status: 500 }
    );
  }
}
