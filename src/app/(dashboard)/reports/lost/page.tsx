/**
 * Page Rapport des Leads Perdus
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  TrendingDown, 
  DollarSign, 
  FileX2, 
  Calendar,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLostReport, type LostReasonBreakdown } from "@/hooks/reports";
import { formatCurrency, formatDate } from "@/lib/utils";

function ReasonChart({ breakdown }: { breakdown: LostReasonBreakdown[] }) {
  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <div className="space-y-4">
      {breakdown.map((item) => (
        <div key={item.reason} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="text-zinc-500">
              {item.count} ({item.percentage}%)
            </span>
          </div>
          <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">
            Montant perdu: {formatCurrency(item.totalAmount)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function LostReportPage() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const { data, isLoading, error } = useLostReport({ period });

  const report = data?.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Perdus</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Analyse des devis non convertis par raison
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-40">
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">{error.message}</p>
          </CardContent>
        </Card>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Perdus</CardTitle>
                <FileX2 className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalLost}</div>
                <p className="text-xs text-zinc-500">
                  Devis marqués comme perdus
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(report.summary.totalAmount)}
                </div>
                <p className="text-xs text-zinc-500">Revenus potentiels perdus</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moyenne par Devis</CardTitle>
                <TrendingDown className="h-4 w-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(report.summary.averageAmount)}
                </div>
                <p className="text-xs text-zinc-500">Valeur moyenne perdue</p>
              </CardContent>
            </Card>
          </div>

          {/* Period info */}
          <div className="text-sm text-zinc-500 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Période: {formatDate(report.period.start)} - {formatDate(report.period.end)}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Reason Breakdown */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-zinc-500" />
                  <CardTitle className="text-lg">Répartition par Raison</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {report.reasonBreakdown.length === 0 ? (
                  <p className="text-center text-zinc-500 py-8">
                    Aucune donnée pour cette période
                  </p>
                ) : (
                  <ReasonChart breakdown={report.reasonBreakdown} />
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques Clés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {report.reasonBreakdown.length > 0 && (
                  <>
                    <div>
                      <p className="text-sm text-zinc-500">Raison principale</p>
                      <p className="text-lg font-semibold">
                        {report.reasonBreakdown[0].label}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {report.reasonBreakdown[0].percentage}% des pertes
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Impact financier #1</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(report.reasonBreakdown[0].totalAmount)}
                      </p>
                      <p className="text-sm text-zinc-500">
                        Dû à: {report.reasonBreakdown[0].label}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Devis List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détail des Devis Perdus</CardTitle>
            </CardHeader>
            <CardContent>
              {report.devis.length === 0 ? (
                <p className="text-center text-zinc-500 py-8">
                  Aucun devis perdu sur cette période
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Devis</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Date de perte</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.devis.map((devis) => (
                      <TableRow key={devis.id}>
                        <TableCell>
                          <div className="font-mono">{devis.devisNumber}</div>
                          <div className="text-xs text-zinc-500">
                            {devis.vehicle.fullName}
                          </div>
                        </TableCell>
                        <TableCell>{devis.client.fullName}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(devis.totalTTC)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {devis.lostReasonLabel || "Non spécifié"}
                          </Badge>
                          {devis.lostNotes && (
                            <p className="text-xs text-zinc-500 mt-1 truncate max-w-[200px]">
                              {devis.lostNotes}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-zinc-500">
                          {devis.lostAt ? formatDate(devis.lostAt) : "-"}
                        </TableCell>
                        <TableCell>
                          <Link href={`/devis/${devis.id}`}>
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
