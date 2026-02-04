"use client";

import { memo, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Pencil, Trash2, Car, FileText, Plus } from "lucide-react";
import { VehicleForm } from "./vehicle-form";
import type { VehicleFormData } from "@/lib/validations/client";
import type { Vehicle } from "@/types";

interface VehicleWithCount extends Vehicle {
  _count?: {
    devis: number;
  };
}

interface VehicleListProps {
  vehicles: VehicleWithCount[];
  clientId: string;
  onAdd: (data: VehicleFormData) => Promise<void>;
  onEdit: (id: string, data: VehicleFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const VehicleList = memo(function VehicleList({
  vehicles,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: VehicleListProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleWithCount | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<VehicleWithCount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = useCallback(
    async (data: VehicleFormData) => {
      setIsSubmitting(true);
      try {
        await onAdd(data);
        setAddDialogOpen(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onAdd]
  );

  const handleEdit = useCallback(
    async (data: VehicleFormData) => {
      if (!editingVehicle) return;
      setIsSubmitting(true);
      try {
        await onEdit(editingVehicle.id, data);
        setEditingVehicle(null);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingVehicle, onEdit]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingVehicle) return;
    setIsSubmitting(true);
    try {
      await onDelete(deletingVehicle.id);
      setDeletingVehicle(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [deletingVehicle, onDelete]);

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
          <Car className="h-5 w-5" />
          Véhicules ({vehicles.length})
        </h3>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un véhicule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un véhicule</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau véhicule pour ce client.
              </DialogDescription>
            </DialogHeader>
            <VehicleForm
              onSubmit={handleAdd}
              onCancel={() => setAddDialogOpen(false)}
              isLoading={isSubmitting}
              submitLabel="Ajouter le véhicule"
            />
          </DialogContent>
        </Dialog>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-zinc-50 dark:bg-zinc-900">
          <Car className="mx-auto h-10 w-10 text-zinc-400" />
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Aucun véhicule enregistré
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Véhicule</TableHead>
                <TableHead>Immatriculation</TableHead>
                <TableHead>Couleur</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Devis</span>
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </TableCell>
                  <TableCell>
                    {vehicle.licensePlate || (
                      <span className="text-zinc-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {vehicle.color || (
                      <span className="text-zinc-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm">
                      {vehicle._count?.devis ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingVehicle(vehicle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingVehicle(vehicle)}
                        disabled={(vehicle._count?.devis ?? 0) > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingVehicle} onOpenChange={() => setEditingVehicle(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le véhicule</DialogTitle>
            <DialogDescription>
              Modifiez les informations du véhicule.
            </DialogDescription>
          </DialogHeader>
          {editingVehicle && (
            <VehicleForm
              defaultValues={{
                make: editingVehicle.make,
                model: editingVehicle.model,
                year: editingVehicle.year,
                vin: editingVehicle.vin || "",
                licensePlate: editingVehicle.licensePlate || "",
                color: editingVehicle.color || "",
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditingVehicle(null)}
              isLoading={isSubmitting}
              submitLabel="Modifier le véhicule"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingVehicle} onOpenChange={() => setDeletingVehicle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le véhicule ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le véhicule{" "}
              <strong>
                {deletingVehicle?.year} {deletingVehicle?.make} {deletingVehicle?.model}
              </strong>
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default VehicleList;
