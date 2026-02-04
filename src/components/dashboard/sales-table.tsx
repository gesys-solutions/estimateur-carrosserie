/**
 * Today's Sales Table
 * Shows list of accepted quotes for today
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardSales } from "./hooks";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface SalesTableProps {
  className?: string;
}

export function SalesTable({ className }: SalesTableProps) {
  const { data, isLoading, error } = useDashboardSales();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(value);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center text-red-500">
          Erreur de chargement
        </div>
      );
    }

    if (!data || data.sales.length === 0) {
      return (
        <div className="p-8 text-center text-zinc-500">
          Aucune vente aujourd&apos;hui
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Véhicule</TableHead>
            <TableHead>Estimateur</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-mono text-sm">
                {sale.devisNumber.slice(0, 8)}
              </TableCell>
              <TableCell>{sale.client.name}</TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-400">
                {sale.vehicle.description}
              </TableCell>
              <TableCell>{sale.estimateur.name}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(sale.amount)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/devis/${sale.id}`}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ventes du jour</CardTitle>
        <CardDescription>
          {data && data.count > 0 && (
            <>
              {data.count} vente{data.count > 1 ? "s" : ""} • Total: {formatCurrency(data.totalAmount)}
            </>
          )}
          {data && data.count === 0 && (
            <>Devis acceptés aujourd&apos;hui ({format(new Date(), "EEEE d MMMM", { locale: fr })})</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">{renderContent()}</CardContent>
    </Card>
  );
}
