/**
 * Leads CSV Export API
 * GET /api/v1/leads/export - Export leads to CSV
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";

// Status labels in French
const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  ENVOYE: "Envoyé",
  EN_NEGOCIATION: "En négociation",
};

// Relance type labels
const RELANCE_TYPE_LABELS: Record<string, string> = {
  APPEL: "Appel",
  EMAIL: "Courriel",
  SMS: "SMS",
  VISITE: "Visite",
};

export async function GET(request: NextRequest) {
  try {
    const tenant = await withTenant();
    const now = new Date();

    // Get all leads (limit to 1000)
    const leads = await prisma.devis.findMany({
      where: {
        estimateur: { tenantId: tenant.tenantId },
        status: { in: ["BROUILLON", "ENVOYE", "EN_NEGOCIATION"] },
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
        relances: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            type: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 1000,
    });

    // Build CSV content
    // UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";
    
    const headers = [
      "Numéro",
      "Client",
      "Téléphone",
      "Courriel",
      "Véhicule",
      "Plaque",
      "Montant",
      "Statut",
      "Créé le",
      "Âge (jours)",
      "Dernière relance",
      "Type relance",
    ];

    const rows = leads.map((lead) => {
      const age = differenceInDays(now, lead.createdAt);
      const lastRelance = lead.relances[0];
      
      return [
        lead.devisNumber,
        `${lead.client.firstName} ${lead.client.lastName}`,
        lead.client.phone,
        lead.client.email || "",
        `${lead.vehicle.make} ${lead.vehicle.model} ${lead.vehicle.year}`,
        lead.vehicle.licensePlate || "",
        Number(lead.totalTTC).toFixed(2),
        STATUS_LABELS[lead.status] || lead.status,
        format(lead.createdAt, "yyyy-MM-dd", { locale: fr }),
        age.toString(),
        lastRelance ? format(lastRelance.createdAt, "yyyy-MM-dd", { locale: fr }) : "",
        lastRelance ? RELANCE_TYPE_LABELS[lastRelance.type] || lastRelance.type : "",
      ];
    });

    // Escape CSV values
    const escapeCSV = (value: string): string => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent =
      BOM +
      headers.map(escapeCSV).join(",") +
      "\n" +
      rows.map((row) => row.map(escapeCSV).join(",")).join("\n");

    // Generate filename with date
    const dateStr = format(now, "yyyy-MM-dd");
    const filename = `leads-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Leads export error:", error);
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
