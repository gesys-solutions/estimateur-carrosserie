/**
 * Dialog pour marquer un devis comme perdu
 * Supports two modes:
 * 1. With lead prop (from relances page)
 * 2. With devisId prop (from devis detail page)
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { XCircle } from "lucide-react";
import { useMarkDevisLost, type LeadItem } from "@/hooks";
import { toast } from "sonner";
import { LostReasonLabels, type LostReasonType } from "@/lib/validations/relance";

interface MarkLostDialogPropsWithLead {
  lead: LeadItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devisId?: never;
  devisNumber?: never;
  trigger?: never;
  onSuccess?: never;
}

interface MarkLostDialogPropsWithDevis {
  devisId: string;
  devisNumber?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  lead?: never;
  open?: never;
  onOpenChange?: never;
}

type MarkLostDialogProps = MarkLostDialogPropsWithLead | MarkLostDialogPropsWithDevis;

export function MarkLostDialog(props: MarkLostDialogProps) {
  // Determine mode
  const isLeadMode = 'lead' in props && props.lead !== undefined;
  
  const [internalOpen, setInternalOpen] = useState(false);
  const [reason, setReason] = useState<LostReasonType | "">("");
  const [notes, setNotes] = useState("");

  const markLost = useMarkDevisLost();

  // Handle open state
  const open = isLeadMode ? props.open : internalOpen;
  const setOpen = isLeadMode ? props.onOpenChange : setInternalOpen;

  // Get devis info
  const devisId = isLeadMode ? props.lead?.id : props.devisId;
  const devisNumber = isLeadMode ? props.lead?.devisNumber : props.devisNumber;
  const clientName = isLeadMode ? props.lead?.client?.name : undefined;

  const resetForm = () => {
    setReason("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!devisId) {
      toast.error("Devis non sélectionné");
      return;
    }

    if (!reason) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }

    try {
      await markLost.mutateAsync({
        devisId,
        data: {
          reason: reason as LostReasonType,
          notes: notes.trim() || undefined,
        },
      });

      toast.success("Devis marqué comme perdu");
      resetForm();
      setOpen(false);
      if (!isLeadMode && props.onSuccess) {
        props.onSuccess();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors du marquage"
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Marquer le devis comme perdu</DialogTitle>
          <DialogDescription>
            {devisNumber && `Devis ${devisNumber}`}
            {clientName && ` — ${clientName}`}
            {!devisNumber && !clientName && "Indiquez la raison de la perte de ce devis."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Raison de la perte *</Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as LostReasonType)}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Sélectionnez une raison" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LostReasonLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Détails additionnels sur la raison de la perte..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={markLost.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={markLost.isPending || !reason}
          >
            {markLost.isPending ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Confirmer la perte
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  // Lead mode: controlled dialog
  if (isLeadMode) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  // Devis mode: uncontrolled with trigger button
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {props.trigger || (
          <Button variant="destructive" size="sm">
            <XCircle className="h-4 w-4 mr-1" />
            Marquer perdu
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
