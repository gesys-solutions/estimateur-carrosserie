/**
 * Page Détail Devis
 */

"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DevisStatusBadge, DevisStatusDropdown, DevisItemEditor, DevisTotals } from "@/components/devis";
import { formatDate, formatDateTime, formatPhone } from "@/lib/utils";
import { useDevis, useDeleteDevis } from "@/hooks/devis";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, FileDown, User, Car, Calendar, FileText } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DevisDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const { data, isLoading, error } = useDevis(id);
  const { mutate: deleteDevis, isPending: isDeleting } = useDeleteDevis();

  const handleDelete = () => {
    deleteDevis(id, {
      onSuccess: () => {
        toast.success("Devis supprimé");
        router.push("/devis");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await fetch(`/api/v1/devis/${id}/pdf`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur lors de la génération du PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devis-${devis?.devisNumber || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du téléchargement");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-500">{error?.message || "Devis non trouvé"}</p>
        <Link href="/devis">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  const devis = data.data;
  const isEditable = devis.status === "BROUILLON";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/devis">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">
                {devis.devisNumber}
              </h1>
              <DevisStatusBadge status={devis.status} />
            </div>
            <p className="text-sm text-zinc-500">
              Créé le {formatDateTime(devis.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </Button>
          
          {isEditable && (
            <>
              <Link href={`/devis/${id}/edit`}>
                <Button variant="outline">
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce devis?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Le devis {devis.devisNumber} sera 
                      définitivement supprimé.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? "Suppression..." : "Supprimer"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Status Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statut du devis</CardTitle>
        </CardHeader>
        <CardContent>
          <DevisStatusDropdown
            devisId={id}
            currentStatus={devis.status}
          />
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-500" />
              <CardTitle className="text-lg">Client</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium text-lg">{devis.client.fullName}</p>
            <p className="text-zinc-600 dark:text-zinc-400">
              {formatPhone(devis.client.phone)}
            </p>
            {devis.client.email && (
              <p className="text-zinc-600 dark:text-zinc-400">{devis.client.email}</p>
            )}
            {devis.client.address && (
              <p className="text-zinc-500 text-sm">
                {devis.client.address}
                {devis.client.city && `, ${devis.client.city}`}
                {devis.client.postalCode && ` ${devis.client.postalCode}`}
              </p>
            )}
            <div className="pt-2">
              <Link href={`/clients/${devis.client.id}`}>
                <Button variant="link" className="px-0">
                  Voir la fiche client
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-zinc-500" />
              <CardTitle className="text-lg">Véhicule</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium text-lg">{devis.vehicle.fullName}</p>
            {devis.vehicle.color && (
              <p className="text-zinc-600 dark:text-zinc-400">
                Couleur: {devis.vehicle.color}
              </p>
            )}
            {devis.vehicle.licensePlate && (
              <p className="font-mono text-zinc-600 dark:text-zinc-400">
                Plaque: {devis.vehicle.licensePlate}
              </p>
            )}
            {devis.vehicle.vin && (
              <p className="font-mono text-sm text-zinc-500">
                VIN: {devis.vehicle.vin}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-zinc-500" />
            <CardTitle className="text-lg">Items du devis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DevisItemEditor
            devisId={id}
            items={devis.items}
            isEditable={isEditable}
          />
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm">
          <DevisTotals
            subtotal={devis.totals.subtotal}
            tps={devis.totals.tps}
            tvq={devis.totals.tvq}
            total={devis.totals.total}
          />
        </div>
      </div>

      {/* Notes */}
      {devis.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
              {devis.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reclamation Info (if exists) */}
      {devis.reclamation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Réclamation Assurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{devis.reclamation.assurance.name}</p>
            {devis.reclamation.claimNumber && (
              <p className="font-mono text-zinc-600">
                N° réclamation: {devis.reclamation.claimNumber}
              </p>
            )}
            <p className="text-zinc-500">Statut: {devis.reclamation.status}</p>
            {devis.reclamation.agreedPrice && (
              <p className="font-medium text-green-600">
                Prix convenu: {devis.reclamation.agreedPrice.toFixed(2)} $
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Follow-ups */}
      {devis.relances.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-zinc-500" />
              <CardTitle className="text-lg">Dernières relances</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devis.relances.slice(0, 5).map((relance) => (
                <div
                  key={relance.id}
                  className="border-l-2 border-zinc-200 pl-4 py-1"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{relance.type}</span>
                    <span className="text-zinc-500">par {relance.createdBy}</span>
                    <span className="text-zinc-400">
                      {formatDate(relance.createdAt)}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                    {relance.notes}
                  </p>
                  {relance.outcome && (
                    <p className="text-sm text-green-600 mt-1">
                      Résultat: {relance.outcome}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
