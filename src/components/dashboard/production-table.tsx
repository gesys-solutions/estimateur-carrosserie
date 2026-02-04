/**
 * Production Table
 * Shows quotes currently in repair (EN_REPARATION)
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
import { Badge } from "@/components/ui/badge";
import { useDashboardProduction } from "./hooks";
import Link from "next/link";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductionTableProps {
  className?: string;
}

export function ProductionTable({ className }: ProductionTableProps) {
  const { data, isLoading, error } = useDashboardProduction();

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

    if (!data || data.items.length === 0) {
      return (
        <div className="p-8 text-center text-zinc-500">
          Aucun véhicule en réparation
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
            <TableHead className="text-center">Jours</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((item) => (
            <TableRow key={item.id} className={cn(item.isOverdue && "bg-red-50 dark:bg-red-900/10")}>
              <TableCell className="font-mono text-sm">
                {item.devisNumber.slice(0, 8)}
              </TableCell>
              <TableCell>
                <div>{item.client.name}</div>
                <div className="text-xs text-zinc-500">{item.client.phone}</div>
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-400">
                <div>{item.vehicle.description}</div>
                {item.vehicle.licensePlate && (
                  <div className="text-xs font-mono">{item.vehicle.licensePlate}</div>
                )}
              </TableCell>
              <TableCell>{item.estimateur.name}</TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={item.isOverdue ? "destructive" : "secondary"}
                  className="gap-1"
                >
                  {item.isOverdue && <AlertTriangle className="h-3 w-3" />}
                  {item.daysInShop}j
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(item.amount)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/devis/${item.id}`}
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
        <CardTitle className="flex items-center gap-2">
          Production en cours
          {data && data.overdueCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {data.overdueCount} en retard
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {data && (
            <>
              {data.count} véhicule{data.count > 1 ? "s" : ""} en réparation
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">{renderContent()}</CardContent>
    </Card>
  );
}
