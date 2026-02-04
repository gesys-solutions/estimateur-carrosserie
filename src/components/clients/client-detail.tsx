/**
 * Client detail view component
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  FileText,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { VehicleForm } from "./vehicle-form";
import { VehicleDialog } from "./vehicle-dialog";
import {
  useClient,
  useDeleteClient,
  useCreateVehicle,
  useDeleteVehicle,
  type VehicleListItem,
} from "@/hooks/clients";
import { formatDate, formatCurrency, formatPhone } from "@/lib/utils";
import type { VehicleFormData } from "@/lib/validations/client";

interface ClientDetailProps {
  clientId: string;
}

// Status badge colors
const statusColors: Record<string, string> = {
  BROUILLON: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ENVOYE: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  EN_NEGOCIATION: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  ACCEPTE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REFUSE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  EN_REPARATION: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  TERMINE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
};

const statusLabels: Record<string, string> = {
  BROUILLON: "Brouillon",
  ENVOYE: "Envoyé",
  EN_NEGOCIATION: "En négociation",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
  EN_REPARATION: "En réparation",
  TERMINE: "Terminé",
};

export function ClientDetailView({ clientId }: ClientDetailProps) {
  const router = useRouter();
  const { data, isLoading, error } = useClient(clientId);
  const deleteClientMutation = useDeleteClient();
  const createVehicleMutation = useCreateVehicle();
  const deleteVehicleMutation = useDeleteVehicle(clientId);

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleListItem | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<VehicleListItem | null>(null);
  const [showDeleteClient, setShowDeleteClient] = useState(false);

  const client = data?.data;

  const handleAddVehicle = async (vehicleData: VehicleFormData) => {
    try {
      await createVehicleMutation.mutateAsync({
        clientId,
        data: vehicleData,
      });
      toast.success("Véhicule ajouté avec succès");
      setShowAddVehicle(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'ajout du véhicule");
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deletingVehicle) return;
    try {
      await deleteVehicleMutation.mutateAsync(deletingVehicle.id);
      toast.success("Véhicule supprimé avec succès");
      setDeletingVehicle(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  const handleDeleteClient = async () => {
    try {
      await deleteClientMutation.mutateAsync(clientId);
      toast.success("Client supprimé avec succès");
      router.push("/clients");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-red-500">
            {error?.message || "Client non trouvé"}
          </p>
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={() => router.push("/clients")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.fullName}</h1>
            <p className="text-zinc-500">Client depuis le {formatDate(client.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/clients/${clientId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button onClick={() => router.push(`/devis/new?clientId=${clientId}`)}>
            <FileText className="mr-2 h-4 w-4" />
            Nouveau devis
          </Button>
        </div>
      </div>

      {/* Info and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-500">Téléphone</p>
                  <p className="font-medium">{formatPhone(client.phone)}</p>
                </div>
              </div>
              {client.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-zinc-400" />
                  <div>
                    <p className="text-sm text-zinc-500">Courriel</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
              )}
            </div>
            {(client.address || client.city) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-500">Adresse</p>
                  <p className="font-medium">
                    {client.address && <span>{client.address}<br /></span>}
                    {client.city && <span>{client.city}</span>}
                    {client.postalCode && <span>, {client.postalCode}</span>}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-zinc-500">Véhicules</span>
              <span className="font-semibold">{client.counts.vehicles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Devis</span>
              <span className="font-semibold">{client.stats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Acceptés</span>
              <span className="font-semibold text-green-600">{client.stats.approved}</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="text-zinc-500">Montant total</span>
              <span className="font-semibold">{formatCurrency(client.stats.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Véhicules ({client.vehicles.length})
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddVehicle(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {client.vehicles.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">
              Aucun véhicule enregistré
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Immatriculation</TableHead>
                  <TableHead className="hidden md:table-cell">Couleur</TableHead>
                  <TableHead className="hidden lg:table-cell">VIN</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.fullName}</TableCell>
                    <TableCell>{vehicle.licensePlate || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">{vehicle.color || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-zinc-500">
                      {vehicle.vin || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingVehicle(vehicle)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingVehicle(vehicle)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Devis history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historique des devis ({client.stats.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.devis.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">
              Aucun devis pour ce client
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.devis.map((devis) => (
                  <TableRow
                    key={devis.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/devis/${devis.id}`)}
                  >
                    <TableCell className="font-medium">{devis.number}</TableCell>
                    <TableCell>
                      {devis.vehicle || "—"}
                      {devis.licensePlate && (
                        <span className="ml-2 text-zinc-500">({devis.licensePlate})</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[devis.status] || statusColors.BROUILLON
                        }`}
                      >
                        {statusLabels[devis.status] || devis.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(devis.totalTTC)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-zinc-500">
                      {formatDate(devis.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600">Zone dangereuse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Supprimer ce client</p>
              <p className="text-sm text-zinc-500">
                Cette action est irréversible. Tous les véhicules seront également supprimés.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setShowDeleteClient(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un véhicule</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau véhicule pour {client.fullName}
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            onSubmit={handleAddVehicle}
            onCancel={() => setShowAddVehicle(false)}
            isLoading={createVehicleMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      {editingVehicle && (
        <VehicleDialog
          vehicle={editingVehicle}
          clientId={clientId}
          open={!!editingVehicle}
          onOpenChange={(open) => !open && setEditingVehicle(null)}
        />
      )}

      {/* Delete Vehicle Confirmation */}
      <Dialog open={!!deletingVehicle} onOpenChange={(open) => !open && setDeletingVehicle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le véhicule</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le véhicule{" "}
              <strong>{deletingVehicle?.fullName}</strong> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingVehicle(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVehicle}
              disabled={deleteVehicleMutation.isPending}
            >
              {deleteVehicleMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Confirmation */}
      <Dialog open={showDeleteClient} onOpenChange={setShowDeleteClient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le client</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le client{" "}
              <strong>{client.fullName}</strong> et tous ses véhicules ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteClient(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClient}
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
