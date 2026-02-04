"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AssuranceFormDialog } from "./assurance-form-dialog";
import { toast } from "sonner";

interface Assurance {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  reclamationCount: number;
  createdAt: string;
}

interface AssuranceListResponse {
  data: Assurance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function AssuranceList() {
  const router = useRouter();
  const [assurances, setAssurances] = useState<Assurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [deactivateTarget, setDeactivateTarget] = useState<Assurance | null>(null);

  const fetchAssurances = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { q: searchQuery }),
      });

      const response = await fetch(`/api/v1/assurances?${params}`);
      if (!response.ok) throw new Error("Erreur lors du chargement");

      const data: AssuranceListResponse = await response.json();
      setAssurances(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Erreur lors du chargement des assurances");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery]);

  useEffect(() => {
    fetchAssurances();
  }, [fetchAssurances]);

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;

    try {
      const response = await fetch(`/api/v1/assurances/${deactivateTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la désactivation");

      toast.success("Compagnie désactivée");
      setDeactivateTarget(null);
      fetchAssurances();
    } catch (error) {
      toast.error("Erreur lors de la désactivation");
      console.error(error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchAssurances();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <Input
            placeholder="Rechercher une compagnie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            Rechercher
          </Button>
        </form>
        <AssuranceFormDialog onSuccess={fetchAssurances} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : assurances.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? (
            <p>Aucune compagnie trouvée pour &quot;{searchQuery}&quot;</p>
          ) : (
            <p>Aucune compagnie d&apos;assurance. Ajoutez-en une pour commencer.</p>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead className="text-center">Dossiers</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assurances.map((assurance) => (
                  <TableRow
                    key={assurance.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/assurances/${assurance.id}`)}
                  >
                    <TableCell className="font-medium">
                      {assurance.name}
                    </TableCell>
                    <TableCell>{assurance.contactName || "—"}</TableCell>
                    <TableCell>{assurance.contactPhone || "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {assurance.reclamationCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={assurance.isActive ? "default" : "outline"}
                      >
                        {assurance.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AssuranceFormDialog
                          assurance={assurance}
                          onSuccess={fetchAssurances}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Modifier
                            </Button>
                          }
                        />
                        {assurance.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setDeactivateTarget(assurance)}
                          >
                            Désactiver
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} sur {pagination.pages} ({pagination.total}{" "}
                compagnies)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver cette compagnie?</AlertDialogTitle>
            <AlertDialogDescription>
              La compagnie &quot;{deactivateTarget?.name}&quot; sera désactivée mais
              conservée dans l&apos;historique. Elle ne sera plus proposée pour les
              nouvelles réclamations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
