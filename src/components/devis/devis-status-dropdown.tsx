/**
 * Devis Status Dropdown Component
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DevisStatusBadge } from "./devis-status-badge";
import { 
  DevisStatusType, 
  ValidStatusTransitions, 
  DevisStatusLabels 
} from "@/lib/validations/devis";
import { useChangeDevisStatus } from "@/hooks/devis";
import { toast } from "sonner";

interface DevisStatusDropdownProps {
  devisId: string;
  currentStatus: DevisStatusType;
  onStatusChange?: (newStatus: DevisStatusType) => void;
}

export function DevisStatusDropdown({ 
  devisId, 
  currentStatus, 
  onStatusChange 
}: DevisStatusDropdownProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DevisStatusType | null>(null);
  const [notes, setNotes] = useState("");
  
  const { mutate: changeStatus, isPending } = useChangeDevisStatus();
  
  const validTransitions = ValidStatusTransitions[currentStatus] || [];
  
  if (validTransitions.length === 0) {
    return <DevisStatusBadge status={currentStatus} />;
  }

  const handleStatusSelect = (status: DevisStatusType) => {
    setSelectedStatus(status);
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedStatus) return;
    
    changeStatus(
      { id: devisId, status: selectedStatus, notes: notes || undefined },
      {
        onSuccess: () => {
          toast.success(`Statut changé vers ${DevisStatusLabels[selectedStatus]}`);
          setIsDialogOpen(false);
          setNotes("");
          setSelectedStatus(null);
          onStatusChange?.(selectedStatus);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DevisStatusBadge status={currentStatus} />
        <Select
          value=""
          onValueChange={(value) => handleStatusSelect(value as DevisStatusType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Changer statut" />
          </SelectTrigger>
          <SelectContent>
            {validTransitions.map((status) => (
              <SelectItem key={status} value={status}>
                {DevisStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le changement de statut</DialogTitle>
            <DialogDescription>
              Vous allez changer le statut de{" "}
              <strong>{DevisStatusLabels[currentStatus]}</strong> vers{" "}
              <strong>{selectedStatus ? DevisStatusLabels[selectedStatus] : ""}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajouter une note sur ce changement..."
                className="w-full min-h-[100px] p-2 border rounded-md resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending ? "En cours..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
