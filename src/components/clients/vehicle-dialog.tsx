/**
 * Vehicle edit dialog component
 */

"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VehicleForm } from "./vehicle-form";
import { useUpdateVehicle, type VehicleListItem } from "@/hooks/clients";
import type { VehicleFormData } from "@/lib/validations/client";

interface VehicleDialogProps {
  vehicle: VehicleListItem;
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehicleDialog({
  vehicle,
  clientId,
  open,
  onOpenChange,
}: VehicleDialogProps) {
  const updateVehicleMutation = useUpdateVehicle(clientId);

  const handleSubmit = async (data: VehicleFormData) => {
    try {
      await updateVehicleMutation.mutateAsync({
        id: vehicle.id,
        data,
      });
      toast.success("Véhicule mis à jour avec succès");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier le véhicule</DialogTitle>
          <DialogDescription>
            Modifiez les informations du véhicule {vehicle.fullName}
          </DialogDescription>
        </DialogHeader>
        <VehicleForm
          defaultValues={{
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            vin: vehicle.vin || "",
            licensePlate: vehicle.licensePlate || "",
            color: vehicle.color || "",
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={updateVehicleMutation.isPending}
          submitLabel="Enregistrer"
        />
      </DialogContent>
    </Dialog>
  );
}
