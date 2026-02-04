/**
 * Devis List Component
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { DevisStatusBadge } from "./devis-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DevisStatusLabels, DevisStatusType, DevisStatus } from "@/lib/validations/devis";
import { useDevisList, DevisListItem } from "@/hooks/devis";
import { useDebounce } from "@/hooks/use-debounce";
import { Eye, FileText, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface DevisListProps {
  clientId?: string;
}

export function DevisList({ clientId }: DevisListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DevisStatusType | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 20;

  const debouncedSearch = useDebounce(search, 300);

  const params = useMemo(() => ({
    page,
    limit,
    q: debouncedSearch || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    clientId,
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  }), [page, debouncedSearch, statusFilter, clientId]);

  const { data, isLoading, error } = useDevisList(params);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value as DevisStatusType | "ALL");
    setPage(1);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-red-500">
            Erreur: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par numéro, client, plaque..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              {Object.entries(DevisStatus).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {DevisStatusLabels[value as DevisStatusType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Link href="/devis/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun devis trouvé</p>
              {!clientId && (
                <Link href="/devis/new">
                  <Button variant="link" className="mt-2">
                    Créer votre premier devis
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant TTC</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((devis: DevisListItem) => (
                  <TableRow key={devis.id}>
                    <TableCell className="font-mono font-medium">
                      {devis.devisNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{devis.client.fullName}</p>
                        <p className="text-sm text-zinc-500">{devis.client.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{devis.vehicle.fullName}</p>
                        {devis.vehicle.licensePlate && (
                          <p className="text-sm text-zinc-500 font-mono">
                            {devis.vehicle.licensePlate}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DevisStatusBadge status={devis.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(devis.totalTTC)}
                    </TableCell>
                    <TableCell className="text-zinc-500">
                      {formatDate(devis.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/devis/${devis.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
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

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Page {data.pagination.page} sur {data.pagination.pages} ({data.pagination.total} devis)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pagination.pages}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
