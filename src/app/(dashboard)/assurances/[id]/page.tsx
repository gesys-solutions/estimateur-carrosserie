"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { AssuranceFormDialog } from "@/components/assurances";
import { toast } from "sonner";
import { ReclamationStatusLabels, ReclamationStatusColors, formatPrice } from "@/lib/validations/assurance";

interface AssuranceDetail {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  reclamationCount: number;
  recentReclamations: {
    id: string;
    devisId: string;
    devisNumber: string;
    clientName: string;
    claimNumber: string | null;
    status: string;
    agreedPrice: number | null;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function AssuranceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [assurance, setAssurance] = useState<AssuranceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssurance() {
      try {
        const response = await fetch(`/api/v1/assurances/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Compagnie d'assurance introuvable");
            router.push("/assurances");
            return;
          }
          throw new Error("Erreur lors du chargement");
        }
        const { data } = await response.json();
        setAssurance(data);
      } catch (error) {
        toast.error("Erreur lors du chargement");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssurance();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!assurance) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/assurances"
              className="text-muted-foreground hover:text-foreground"
            >
              ← Retour
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2">
            {assurance.name}
          </h1>
          <Badge
            variant={assurance.isActive ? "default" : "outline"}
            className="mt-2"
          >
            {assurance.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>
        <AssuranceFormDialog
          assurance={assurance}
          onSuccess={() => router.refresh()}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assurance.contactName && (
              <div>
                <span className="text-muted-foreground text-sm">Contact:</span>
                <p className="font-medium">{assurance.contactName}</p>
              </div>
            )}
            {assurance.contactPhone && (
              <div>
                <span className="text-muted-foreground text-sm">Téléphone:</span>
                <p className="font-medium">
                  <a href={`tel:${assurance.contactPhone}`} className="hover:underline">
                    {assurance.contactPhone}
                  </a>
                </p>
              </div>
            )}
            {assurance.contactEmail && (
              <div>
                <span className="text-muted-foreground text-sm">Email:</span>
                <p className="font-medium">
                  <a href={`mailto:${assurance.contactEmail}`} className="hover:underline">
                    {assurance.contactEmail}
                  </a>
                </p>
              </div>
            )}
            {assurance.address && (
              <div>
                <span className="text-muted-foreground text-sm">Adresse:</span>
                <p className="font-medium">{assurance.address}</p>
              </div>
            )}
            {!assurance.contactName && !assurance.contactPhone && !assurance.contactEmail && !assurance.address && (
              <p className="text-muted-foreground">Aucune coordonnée enregistrée</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-muted-foreground text-sm">Nombre de dossiers:</span>
              <p className="text-2xl font-bold">{assurance.reclamationCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Créée le:</span>
              <p className="font-medium">
                {new Date(assurance.createdAt).toLocaleDateString("fr-CA")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {assurance.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{assurance.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dossiers récents</CardTitle>
        </CardHeader>
        <CardContent>
          {assurance.recentReclamations.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              Aucun dossier associé à cette compagnie
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Devis</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>N° Réclamation</TableHead>
                  <TableHead>Prix convenu</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assurance.recentReclamations.map((reclamation) => (
                  <TableRow
                    key={reclamation.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/devis/${reclamation.devisId}`)}
                  >
                    <TableCell className="font-medium">
                      {reclamation.devisNumber}
                    </TableCell>
                    <TableCell>{reclamation.clientName}</TableCell>
                    <TableCell>{reclamation.claimNumber || "—"}</TableCell>
                    <TableCell>
                      {reclamation.agreedPrice
                        ? formatPrice(reclamation.agreedPrice)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          ReclamationStatusColors[
                            reclamation.status as keyof typeof ReclamationStatusColors
                          ]
                        }
                      >
                        {ReclamationStatusLabels[
                          reclamation.status as keyof typeof ReclamationStatusLabels
                        ] || reclamation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(reclamation.createdAt).toLocaleDateString("fr-CA")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
