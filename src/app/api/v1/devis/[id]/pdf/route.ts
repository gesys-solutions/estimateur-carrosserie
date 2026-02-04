/**
 * Devis PDF Export API Route
 * GET /api/v1/devis/[id]/pdf - Generate PDF for devis
 * 
 * Note: This is a stub implementation for v1.0
 * Will return a basic HTML-based PDF using simple server-side rendering
 * Future versions can use react-pdf or puppeteer for professional PDFs
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant";
import { TPS_RATE, TVQ_RATE, DevisItemTypeLabels, DevisStatusLabels } from "@/lib/validations/devis";

type RouteParams = { params: Promise<{ id: string }> };

// Simple currency formatter
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

// Simple date formatter
function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const tenant = await withTenant();
    const { id } = await params;

    // Fetch devis with all related data
    const devis = await prisma.devis.findFirst({
      where: {
        id,
        estimateur: tenant.where(),
      },
      include: {
        client: true,
        vehicle: true,
        estimateur: {
          include: {
            tenant: true,
          },
        },
        items: {
          orderBy: [
            { type: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!devis) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Group items by type
    const itemsByType: Record<string, typeof devis.items> = {
      MAIN_OEUVRE: [],
      PIECE: [],
      PEINTURE: [],
      AUTRE: [],
    };
    
    devis.items.forEach(item => {
      if (itemsByType[item.type]) {
        itemsByType[item.type].push(item);
      }
    });

    // Generate HTML for PDF
    const html = generatePdfHtml({
      devis,
      itemsByType,
      tenant: devis.estimateur.tenant,
    });

    // For v1.0, we return HTML that can be printed as PDF by the browser
    // Future: Use puppeteer or react-pdf for server-side PDF generation
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="devis-${devis.devisNumber}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}

interface PdfData {
  devis: {
    id: string;
    devisNumber: string;
    status: string;
    totalHT: unknown;
    totalTPS: unknown;
    totalTVQ: unknown;
    totalTTC: unknown;
    notes: string | null;
    createdAt: Date;
    client: {
      firstName: string;
      lastName: string;
      email: string | null;
      phone: string;
      address: string | null;
      city: string | null;
      postalCode: string | null;
    };
    vehicle: {
      make: string;
      model: string;
      year: number;
      vin: string | null;
      licensePlate: string | null;
      color: string | null;
    };
    estimateur: {
      firstName: string;
      lastName: string;
    };
    items: Array<{
      id: string;
      type: string;
      description: string;
      quantity: unknown;
      unitPrice: unknown;
      total: unknown;
    }>;
  };
  itemsByType: Record<string, Array<{
    id: string;
    type: string;
    description: string;
    quantity: unknown;
    unitPrice: unknown;
    total: unknown;
  }>>;
  tenant: {
    name: string;
  };
}

function generatePdfHtml({ devis, itemsByType, tenant }: PdfData): string {
  const itemTypes = ['MAIN_OEUVRE', 'PIECE', 'PEINTURE', 'AUTRE'] as const;
  
  const itemsHtml = itemTypes
    .filter(type => itemsByType[type].length > 0)
    .map(type => {
      const items = itemsByType[type];
      const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
      
      return `
        <div class="section">
          <h3>${DevisItemTypeLabels[type]}</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th class="description">Description</th>
                <th class="qty">Qté</th>
                <th class="price">Prix unit.</th>
                <th class="total">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td class="description">${escapeHtml(item.description)}</td>
                  <td class="qty">${Number(item.quantity)}</td>
                  <td class="price">${formatCurrency(Number(item.unitPrice))}</td>
                  <td class="total">${formatCurrency(Number(item.total))}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="subtotal-label">Sous-total ${DevisItemTypeLabels[type]}</td>
                <td class="subtotal-value">${formatCurrency(subtotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devis ${devis.devisNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    @media print {
      body {
        padding: 0;
        max-width: none;
      }
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }
    
    .company-info h1 {
      font-size: 24px;
      margin-bottom: 5px;
    }
    
    .devis-info {
      text-align: right;
    }
    
    .devis-number {
      font-size: 18px;
      font-weight: bold;
      font-family: monospace;
    }
    
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 5px;
    }
    
    .status-BROUILLON { background: #f3f4f6; color: #374151; }
    .status-ENVOYE { background: #dbeafe; color: #1e40af; }
    .status-EN_NEGOCIATION { background: #fef3c7; color: #92400e; }
    .status-ACCEPTE { background: #d1fae5; color: #065f46; }
    .status-REFUSE { background: #fee2e2; color: #991b1b; }
    .status-EN_REPARATION { background: #e9d5ff; color: #6b21a8; }
    .status-TERMINE { background: #d1fae5; color: #047857; }
    
    .info-section {
      display: flex;
      gap: 40px;
      margin-bottom: 30px;
    }
    
    .info-box {
      flex: 1;
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
    }
    
    .info-box h2 {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-box p {
      margin-bottom: 4px;
    }
    
    .info-box .name {
      font-size: 16px;
      font-weight: 600;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section h3 {
      font-size: 14px;
      color: #374151;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    
    .items-table th,
    .items-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .items-table th {
      background: #f3f4f6;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .items-table .qty,
    .items-table .price,
    .items-table .total {
      text-align: right;
      width: 100px;
    }
    
    .items-table tfoot td {
      font-weight: 600;
      background: #f9fafb;
    }
    
    .subtotal-label {
      text-align: right;
    }
    
    .subtotal-value {
      text-align: right;
    }
    
    .totals-section {
      margin-top: 30px;
      margin-left: auto;
      width: 300px;
    }
    
    .totals-table {
      width: 100%;
    }
    
    .totals-table td {
      padding: 8px 0;
    }
    
    .totals-table td:last-child {
      text-align: right;
      font-weight: 500;
    }
    
    .totals-table .total-row td {
      font-size: 16px;
      font-weight: 700;
      border-top: 2px solid #333;
      padding-top: 12px;
    }
    
    .totals-table .total-row td:last-child {
      color: #059669;
    }
    
    .notes-section {
      margin-top: 30px;
      padding: 15px;
      background: #fffbeb;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }
    
    .notes-section h3 {
      margin-bottom: 10px;
    }
    
    .signature-section {
      margin-top: 50px;
      display: flex;
      gap: 60px;
    }
    
    .signature-box {
      flex: 1;
    }
    
    .signature-line {
      border-bottom: 1px solid #333;
      height: 60px;
      margin-bottom: 5px;
    }
    
    .signature-label {
      font-size: 11px;
      color: #6b7280;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
    }
    
    @media print {
      .signature-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>${escapeHtml(tenant.name)}</h1>
      <p>Carrosserie automobile</p>
    </div>
    <div class="devis-info">
      <div class="devis-number">${devis.devisNumber}</div>
      <div>Date: ${formatDate(devis.createdAt)}</div>
      <div class="status status-${devis.status}">${DevisStatusLabels[devis.status as keyof typeof DevisStatusLabels] || devis.status}</div>
    </div>
  </div>
  
  <div class="info-section">
    <div class="info-box">
      <h2>Client</h2>
      <p class="name">${escapeHtml(devis.client.firstName)} ${escapeHtml(devis.client.lastName)}</p>
      <p>${escapeHtml(devis.client.phone)}</p>
      ${devis.client.email ? `<p>${escapeHtml(devis.client.email)}</p>` : ''}
      ${devis.client.address ? `<p>${escapeHtml(devis.client.address)}</p>` : ''}
      ${devis.client.city || devis.client.postalCode ? `<p>${[devis.client.city, devis.client.postalCode].filter(Boolean).join(' ')}</p>` : ''}
    </div>
    
    <div class="info-box">
      <h2>Véhicule</h2>
      <p class="name">${devis.vehicle.year} ${escapeHtml(devis.vehicle.make)} ${escapeHtml(devis.vehicle.model)}</p>
      ${devis.vehicle.color ? `<p>Couleur: ${escapeHtml(devis.vehicle.color)}</p>` : ''}
      ${devis.vehicle.licensePlate ? `<p>Plaque: <strong>${escapeHtml(devis.vehicle.licensePlate)}</strong></p>` : ''}
      ${devis.vehicle.vin ? `<p style="font-family: monospace; font-size: 10px;">VIN: ${escapeHtml(devis.vehicle.vin)}</p>` : ''}
    </div>
  </div>
  
  ${itemsHtml}
  
  ${devis.items.length === 0 ? '<p style="text-align: center; color: #9ca3af; padding: 40px;">Aucun item dans ce devis</p>' : ''}
  
  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td>Sous-total</td>
        <td>${formatCurrency(Number(devis.totalHT))}</td>
      </tr>
      <tr>
        <td>TPS (${(TPS_RATE * 100).toFixed(0)}%)</td>
        <td>${formatCurrency(Number(devis.totalTPS))}</td>
      </tr>
      <tr>
        <td>TVQ (${(TVQ_RATE * 100).toFixed(3)}%)</td>
        <td>${formatCurrency(Number(devis.totalTVQ))}</td>
      </tr>
      <tr class="total-row">
        <td>TOTAL TTC</td>
        <td>${formatCurrency(Number(devis.totalTTC))}</td>
      </tr>
    </table>
  </div>
  
  ${devis.notes ? `
    <div class="notes-section">
      <h3>Notes</h3>
      <p>${escapeHtml(devis.notes).replace(/\n/g, '<br>')}</p>
    </div>
  ` : ''}
  
  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Signature du client</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Date</div>
    </div>
  </div>
  
  <div class="footer">
    <p>Devis valide 30 jours • Préparé par ${escapeHtml(devis.estimateur.firstName)} ${escapeHtml(devis.estimateur.lastName)}</p>
    <p>${escapeHtml(tenant.name)} • Tous droits réservés</p>
  </div>
</body>
</html>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
