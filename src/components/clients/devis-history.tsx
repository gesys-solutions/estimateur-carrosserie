"use client";

import { memo } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import type { DevisStatus } from "@/types";

interface DevisHistoryItem {
  id: string;
  devisNumber: string;
  status: DevisStatus;
  totalTTC: number | string;
  createdAt: string | Date;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string | null;
  };
  estimateur: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface DevisHistoryProps {
  devis: DevisHistoryItem[];
  clientId: string;
  isLoading?: boolean;
}

const statusLabels: Record<DevisStatus, string> = {
  BROUILLON: "Brouillon",
  ENVOYE: "Envoyé",
  EN_NEGOCIATION: "En négociation",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
  EN_REPARATION: "En réparation",
  TERMINE: "Terminé",
};

const statusColors: Record<DevisStatus, string> = {
  BROUILLON: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ENVOYE: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  EN_NEGOCIATION: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  ACCEPTE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REFUSE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  EN_REPARATION: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  TERMINE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
};

export const DevisHistory = memo(function DevisHistory({
  devis,
  clientId,
  isLoading = false,
}: DevisHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Historique des devis ({devis.length})
        </h3>
        <Button size="sm" asChild>
          <Link href={`/devis/new?clientId=${clientId}`}>
            Créer un devis
          </Link>
        </Button>
      </div>

      {devis.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-zinc-50 dark:bg-zinc-900">
          <FileText className="mx-auto h-10 w-10 text-zinc-400" />
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Aucun devis pour ce client
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href={`/devis/new?clientId=${clientId}`}>
              Créer le premier devis
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Devis</TableHead>
                <TableHead>Véhicule</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant TTC</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devis.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    <Link
                      href={`/devis/${item.id}`}
                      className="hover:underline"
                    >
                      {item.devisNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {item.vehicle.year} {item.vehicle.make} {item.vehicle.model}
                    {item.vehicle.licensePlate && (
                      <span className="ml-2 text-zinc-500 text-xs">
                        ({item.vehicle.licensePlate})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[item.status]
                      }`}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {Number(item.totalTTC).toLocaleString("fr-CA", {
                      style: "currency",
                      currency: "CAD",
                    })}
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400 text-sm">
                    {new Date(item.createdAt).toLocaleDateString("fr-CA")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/devis/${item.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
});

export default DevisHistory;
