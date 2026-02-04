/**
 * Add Relance Dialog
 * Modal for creating follow-up notes
 * Supports two modes:
 * 1. With lead prop (from relances page)
 * 2. With devisId/devisNumber props (from devis detail page)
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCreateRelance, type LeadItem } from "@/hooks";
import { RelanceTypeLabels, type RelanceTypeType } from "@/lib/validations/relance";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface AddRelanceDialogPropsWithLead {
  lead: LeadItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devisId?: never;
  devisNumber?: never;
}

interface AddRelanceDialogPropsWithDevis {
  devisId: string;
  devisNumber?: string;
  lead?: never;
  open?: never;
  onOpenChange?: never;
}

type AddRelanceDialogProps = AddRelanceDialogPropsWithLead | AddRelanceDialogPropsWithDevis;

export function AddRelanceDialog(props: AddRelanceDialogProps) {
  // Determine mode
  const isLeadMode = 'lead' in props && props.lead !== undefined;
  
  const [internalOpen, setInternalOpen] = useState(false);
  const [type, setType] = useState<RelanceTypeType>("APPEL");
  const [notes, setNotes] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  
  const { mutate: createRelance, isPending } = useCreateRelance();

  // Handle open state
  const open = isLeadMode ? props.open : internalOpen;
  const setOpen = isLeadMode ? props.onOpenChange : setInternalOpen;

  // Get devis info
  const devisId = isLeadMode ? props.lead?.id : props.devisId;
  const devisNumber = isLeadMode ? props.lead?.devisNumber : props.devisNumber;
  const clientName = isLeadMode ? props.lead?.client?.name : undefined;

  const resetForm = () => {
    setType("APPEL");
    setNotes("");
    setNextFollowUp("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!devisId) {
      toast.error("Devis non sélectionné");
      return;
    }

    createRelance(
      {
        devisId,
        data: {
          type,
          notes,
          nextFollowUp: nextFollowUp ? new Date(nextFollowUp).toISOString() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Relance créée");
          resetForm();
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Ajouter une relance</DialogTitle>
        <DialogDescription>
          {devisNumber && `Devis ${devisNumber}`}
          {clientName && ` — ${clientName}`}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type de relance</Label>
          <Select value={type} onValueChange={(v) => setType(v as RelanceTypeType)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RelanceTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Détails de la relance, résultat de l'appel, etc."
            required
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextFollowUp">Prochaine relance (optionnel)</Label>
          <Input
            id="nextFollowUp"
            type="date"
            value={nextFollowUp}
            onChange={(e) => setNextFollowUp(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isPending || !notes.trim()}>
            {isPending ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  // Lead mode: controlled dialog
  if (isLeadMode) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  // Devis mode: uncontrolled with trigger button
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter relance
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
