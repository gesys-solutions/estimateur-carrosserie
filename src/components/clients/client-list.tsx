/**
 * Client list table component with search and pagination
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useClients, type ClientListItem } from "@/hooks/clients";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/utils";

export function ClientList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error } = useClients({
    page,
    limit: 20,
    q: debouncedSearch || undefined,
  });

  const clients = data?.data ?? [];
  const pagination = data?.pagination;

  const handleRowClick = (client: ClientListItem) => {
    router.push(`/clients/${client.id}`);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-red-500">
            Erreur lors du chargement des clients
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Rechercher par nom, téléphone, immatriculation..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
        <Button onClick={() => router.push("/clients/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouveau client
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500 mb-4">
                {debouncedSearch
                  ? "Aucun client trouvé pour cette recherche"
                  : "Aucun client pour le moment"}
              </p>
              {!debouncedSearch && (
                <Button onClick={() => router.push("/clients/new")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter votre premier client
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead className="hidden md:table-cell">Courriel</TableHead>
                  <TableHead className="hidden md:table-cell">Ville</TableHead>
                  <TableHead className="text-center">Véhicules</TableHead>
                  <TableHead className="hidden lg:table-cell">Créé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(client)}
                  >
                    <TableCell className="font-medium">
                      {highlightText(client.fullName, debouncedSearch)}
                    </TableCell>
                    <TableCell>
                      {highlightText(client.phone, debouncedSearch)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-zinc-500">
                      {client.email ? highlightText(client.email, debouncedSearch) : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-zinc-500">
                      {client.city || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-sm">
                        {client.vehicleCount}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-500">
                      {formatDate(client.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {pagination.total} client{pagination.total > 1 ? "s" : ""} au total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} sur {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
