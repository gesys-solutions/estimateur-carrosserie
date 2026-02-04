"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  reclamationCreateSchema,
  reclamationUpdateSchema,
  agreedPriceSchema,
  negotiationNoteSchema,
  ReclamationStatusLabels,
  ReclamationStatusColors,
  formatPrice,
  calculatePriceDifference,
  type ReclamationCreateFormData,
  type ReclamationUpdateFormData,
  type AgreedPriceFormData,
  type NegotiationNoteFormData,
  type ReclamationStatusType,
} from "@/lib/validations/assurance";
import { Building2, DollarSign, MessageSquare, Plus, Edit } from "lucide-react";

interface Assurance {
  id: string;
  name: string;
}

interface NegotiationNote {
  id: string;
  content: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface ReclamationData {
  id: string;
  devisId: string;
  assurance: {
    id: string;
    name: string;
    contactName?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
  };
  claimNumber: string | null;
  adjusterName: string | null;
  adjusterPhone: string | null;
  adjusterEmail: string | null;
  agreedPrice: number | null;
  agreedAt: string | null;
  status: string;
  notes: string | null;
  negotiationNotes: NegotiationNote[];
  createdAt: string;
  updatedAt: string;
}

interface DevisInsuranceSectionProps {
  devisId: string;
  devisTotalTTC: number;
  onUpdate?: () => void;
}

export function DevisInsuranceSection({
  devisId,
  devisTotalTTC,
  onUpdate,
}: DevisInsuranceSectionProps) {
  const [reclamation, setReclamation] = useState<ReclamationData | null>(null);
  const [assurances, setAssurances] = useState<Assurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAgreedPriceDialog, setShowAgreedPriceDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reclamationRes, assurancesRes] = await Promise.all([
        fetch(`/api/v1/devis/${devisId}/insurance`),
        fetch("/api/v1/assurances?limit=100"),
      ]);

      if (reclamationRes.ok) {
        const { data } = await reclamationRes.json();
        setReclamation(data);
      }

      if (assurancesRes.ok) {
        const { data } = await assurancesRes.json();
        setAssurances(data);
      }
    } catch (error) {
      console.error("Error fetching insurance data:", error);
    } finally {
      setLoading(false);
    }
  }, [devisId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateReclamation = async (data: ReclamationCreateFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/devis/${devisId}/insurance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur");
      }

      toast.success("Réclamation créée");
      setShowCreateDialog(false);
      fetchData();
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReclamation = async (data: ReclamationUpdateFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/devis/${devisId}/insurance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur");
      }

      toast.success("Réclamation mise à jour");
      setShowEditDialog(false);
      fetchData();
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetAgreedPrice = async (data: AgreedPriceFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/devis/${devisId}/insurance/agreed-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur");
      }

      toast.success("Prix convenu enregistré");
      setShowAgreedPriceDialog(false);
      fetchData();
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (data: NegotiationNoteFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/devis/${devisId}/insurance/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur");
      }

      toast.success("Note ajoutée");
      setShowNoteDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (!reclamation) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-zinc-500" />
            <CardTitle className="text-lg">Assurance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Ce devis n&apos;est pas encore lié à une réclamation d&apos;assurance.
          </p>
          <CreateReclamationDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            assurances={assurances}
            onSubmit={handleCreateReclamation}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    );
  }

  const priceDiff = reclamation.agreedPrice
    ? calculatePriceDifference(devisTotalTTC, reclamation.agreedPrice)
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-zinc-500" />
            <CardTitle className="text-lg">Assurance</CardTitle>
          </div>
          <Badge
            className={
              ReclamationStatusColors[reclamation.status as ReclamationStatusType]
            }
          >
            {ReclamationStatusLabels[reclamation.status as ReclamationStatusType]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Insurance Company Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Compagnie</p>
            <p className="font-medium">{reclamation.assurance.name}</p>
          </div>
          {reclamation.claimNumber && (
            <div>
              <p className="text-sm text-muted-foreground">N° Réclamation</p>
              <p className="font-mono">{reclamation.claimNumber}</p>
            </div>
          )}
          {reclamation.adjusterName && (
            <div>
              <p className="text-sm text-muted-foreground">Ajusteur</p>
              <p className="font-medium">{reclamation.adjusterName}</p>
              {reclamation.adjusterPhone && (
                <p className="text-sm text-muted-foreground">
                  {reclamation.adjusterPhone}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Agreed Price Widget */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-zinc-500" />
              <span className="font-medium">Prix</span>
            </div>
            <AgreedPriceDialog
              open={showAgreedPriceDialog}
              onOpenChange={setShowAgreedPriceDialog}
              currentAgreedPrice={reclamation.agreedPrice}
              onSubmit={handleSetAgreedPrice}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Devis original</p>
              <p className="text-lg font-mono">{formatPrice(devisTotalTTC)}</p>
            </div>
            {reclamation.agreedPrice !== null && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Prix convenu</p>
                  <p className="text-lg font-mono font-medium">
                    {formatPrice(reclamation.agreedPrice)}
                  </p>
                  {reclamation.agreedAt && (
                    <p className="text-xs text-muted-foreground">
                      le {new Date(reclamation.agreedAt).toLocaleDateString("fr-CA")}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Différence</p>
                  <p
                    className={`text-lg font-mono font-medium ${
                      priceDiff?.isGain ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {(priceDiff?.difference ?? 0) > 0 ? "+" : ""}
                    {formatPrice(priceDiff?.difference ?? 0)}
                    <span className="text-sm ml-1">
                      ({priceDiff?.percentage ?? 0}%)
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <EditReclamationDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          reclamation={reclamation}
          assurances={assurances}
          onSubmit={handleUpdateReclamation}
          isSubmitting={isSubmitting}
        />

        {/* Negotiation Notes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-zinc-500" />
              <span className="font-medium">Notes de négociation</span>
            </div>
            <AddNoteDialog
              open={showNoteDialog}
              onOpenChange={setShowNoteDialog}
              onSubmit={handleAddNote}
              isSubmitting={isSubmitting}
            />
          </div>
          {reclamation.negotiationNotes.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune note de négociation</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reclamation.negotiationNotes.map((note) => (
                <div key={note.id} className="border-l-2 border-zinc-200 pl-3 py-1">
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {note.createdBy.name} —{" "}
                    {new Date(note.createdAt).toLocaleString("fr-CA")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Create Reclamation Dialog
function CreateReclamationDialog({
  open,
  onOpenChange,
  assurances,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assurances: Assurance[];
  onSubmit: (data: ReclamationCreateFormData) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<ReclamationCreateFormData>({
    resolver: zodResolver(reclamationCreateSchema),
    defaultValues: {
      assuranceId: "",
      claimNumber: "",
      adjusterName: "",
      adjusterPhone: "",
      adjusterEmail: "",
      notes: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Lier à une assurance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer une réclamation</DialogTitle>
          <DialogDescription>
            Associez ce devis à une compagnie d&apos;assurance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assuranceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compagnie d&apos;assurance *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assurances.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="claimNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de réclamation</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adjusterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l&apos;ajusteur</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adjusterPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone ajusteur</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="adjusterEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email ajusteur</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Reclamation Dialog
function EditReclamationDialog({
  open,
  onOpenChange,
  reclamation,
  assurances,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reclamation: ReclamationData;
  assurances: Assurance[];
  onSubmit: (data: ReclamationUpdateFormData) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<ReclamationUpdateFormData>({
    resolver: zodResolver(reclamationUpdateSchema),
    defaultValues: {
      assuranceId: reclamation.assurance.id,
      claimNumber: reclamation.claimNumber || "",
      adjusterName: reclamation.adjusterName || "",
      adjusterPhone: reclamation.adjusterPhone || "",
      adjusterEmail: reclamation.adjusterEmail || "",
      status: reclamation.status as ReclamationStatusType,
      notes: reclamation.notes || "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Modifier la réclamation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la réclamation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assuranceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compagnie d&apos;assurance</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assurances.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ReclamationStatusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="claimNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de réclamation</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adjusterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ajusteur</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adjusterPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tél. ajusteur</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Agreed Price Dialog
function AgreedPriceDialog({
  open,
  onOpenChange,
  currentAgreedPrice,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAgreedPrice: number | null;
  onSubmit: (data: AgreedPriceFormData) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<AgreedPriceFormData>({
    resolver: zodResolver(agreedPriceSchema),
    defaultValues: {
      agreedPrice: currentAgreedPrice || 0,
      notes: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {currentAgreedPrice !== null ? "Modifier" : "Saisir prix convenu"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prix convenu</DialogTitle>
          <DialogDescription>
            Enregistrez le prix négocié avec l&apos;assurance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="agreedPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant convenu ($) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Add Note Dialog
function AddNoteDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NegotiationNoteFormData) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<NegotiationNoteFormData>({
    resolver: zodResolver(negotiationNoteSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = (data: NegotiationNoteFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une note
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle note</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Résumé de l'échange, décision, prochaine étape..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Ajout..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
