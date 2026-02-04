/**
 * Page Édition de Devis
 */

"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { DevisItemEditor, DevisTotals } from "@/components/devis";
import { toast } from "sonner";
import { ArrowLeft, Save, User, Car } from "lucide-react";
import { useDevis, useUpdateDevis } from "@/hooks/devis";
import { devisUpdateSchema, DevisUpdateFormData, calculateTaxes } from "@/lib/validations/devis";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditDevisPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const { data, isLoading, error } = useDevis(id);
  const { mutate: updateDevis, isPending: isUpdating } = useUpdateDevis();

  // Local totals state for real-time updates
  const [totals, setTotals] = useState<{
    subtotal: number;
    tps: number;
    tvq: number;
    total: number;
  } | null>(null);

  const form = useForm<DevisUpdateFormData>({
    resolver: zodResolver(devisUpdateSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Update form when data loads
  if (data && !form.formState.isDirty) {
    const devis = data.data;
    if (form.getValues("notes") !== devis.notes) {
      form.reset({
        notes: devis.notes || "",
      });
    }
  }

  const handleSubmit = (formData: DevisUpdateFormData) => {
    updateDevis(
      { id, data: formData },
      {
        onSuccess: () => {
          toast.success("Devis mis à jour");
          router.push(`/devis/${id}`);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleTotalsChange = (newTotals: { subtotal: number; tps: number; tvq: number; total: number }) => {
    setTotals(newTotals);
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
  
  // Only draft devis can be edited
  if (devis.status !== "BROUILLON") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-zinc-600">
          Ce devis ne peut plus être modifié car il n&apos;est plus en brouillon.
        </p>
        <Link href={`/devis/${id}`}>
          <Button variant="outline">Voir le devis</Button>
        </Link>
      </div>
    );
  }

  const displayTotals = totals || devis.totals;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/devis/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Modifier le devis <span className="font-mono">{devis.devisNumber}</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Modifiez les items et les notes du devis
          </p>
        </div>
      </div>

      {/* Info Cards (read-only) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-500" />
              <CardTitle className="text-lg">Client</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{devis.client.fullName}</p>
            <p className="text-sm text-zinc-500">{devis.client.phone}</p>
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
          <CardContent>
            <p className="font-medium">{devis.vehicle.fullName}</p>
            {devis.vehicle.licensePlate && (
              <p className="text-sm text-zinc-500 font-mono">
                {devis.vehicle.licensePlate}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Items du devis</CardTitle>
          <CardDescription>
            Ajoutez, modifiez ou supprimez les items du devis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DevisItemEditor
            devisId={id}
            items={devis.items}
            isEditable={true}
            onTotalsChange={handleTotalsChange}
          />
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm">
          <DevisTotals
            subtotal={displayTotals.subtotal}
            tps={displayTotals.tps}
            tvq={displayTotals.tvq}
            total={displayTotals.total}
          />
        </div>
      </div>

      {/* Notes Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Ajoutez des notes ou observations (optionnel)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Description des dommages, contexte, etc..."
                        className="w-full min-h-[120px] p-3 border rounded-md resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href={`/devis/${id}`}>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
