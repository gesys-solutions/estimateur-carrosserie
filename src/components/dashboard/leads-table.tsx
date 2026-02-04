/**
 * Leads Table
 * Shows pending quotes (BROUILLON/ENVOYE) to follow up
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
import { useDashboardLeads } from "./hooks";
import Link from "next/link";
import { ExternalLink, Phone, Mail, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadsTableProps {
  className?: string;
  limit?: number;
}

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300",
};

const statusLabels: Record<string, string> = {
  BROUILLON: "Brouillon",
  ENVOYE: "Envoyé",
};

export function LeadsTable({ className, limit }: LeadsTableProps) {
  const { data, isLoading, error } = useDashboardLeads();

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
          Aucun lead en attente 🎉
        </div>
      );
    }

    const items = limit ? data.items.slice(0, limit) : data.items;

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Priorité</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Véhicule</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-center">Âge</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className={cn(
                item.needsFollowUp && "bg-yellow-50/50 dark:bg-yellow-900/5"
              )}
            >
              <TableCell>
                <Badge className={cn("capitalize border", priorityColors[item.priority])}>
                  {item.priority === "high" ? "Haute" : item.priority === "medium" ? "Moyenne" : "Basse"}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {item.devisNumber.slice(0, 8)}
              </TableCell>
              <TableCell>
                <div>{item.client.name}</div>
                <div className="flex gap-2 mt-1">
                  {item.client.phone && (
                    <a
                      href={`tel:${item.client.phone}`}
                      className="text-zinc-400 hover:text-blue-500"
                    >
                      <Phone className="h-3 w-3" />
                    </a>
                  )}
                  {item.client.email && (
                    <a
                      href={`mailto:${item.client.email}`}
                      className="text-zinc-400 hover:text-blue-500"
                    >
                      <Mail className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-400">
                {item.vehicle.description}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {statusLabels[item.status] || item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1 text-zinc-500">
                  <Clock className="h-3 w-3" />
                  <span>{item.daysSinceCreation}j</span>
                </div>
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
          Leads en attente
          {data && data.needsFollowUpCount > 0 && (
            <Badge variant="secondary">
              {data.needsFollowUpCount} à relancer
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {data && (
            <>
              {data.byStatus.brouillon} brouillon{data.byStatus.brouillon > 1 ? "s" : ""} •{" "}
              {data.byStatus.envoye} envoyé{data.byStatus.envoye > 1 ? "s" : ""}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">{renderContent()}</CardContent>
    </Card>
  );
}
