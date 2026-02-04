"use client";

import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ClientForm } from "@/components/clients";
import { useClient, useUpdateClient } from "@/hooks/clients";
import type { ClientFormData } from "@/lib/validations/client";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const clientId = params.id;

  const { data, isLoading, error } = useClient(clientId);
  const updateClient = useUpdateClient();

  const client = data?.data;

  const handleSubmit = async (formData: ClientFormData) => {
    try {
      await updateClient.mutateAsync({
        id: clientId,
        data: formData,
      });
      toast.success("Client mis à jour avec succès");
      router.push(`/clients/${clientId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
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
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error?.message || "Client non trouvé"}</p>
        <Button variant="outline" onClick={() => router.push("/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/clients/${clientId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Modifier {client.fullName}</h1>
          <p className="text-zinc-500">Mettez à jour les informations du client</p>
        </div>
      </div>

      <ClientForm
        defaultValues={{
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email || "",
          phone: client.phone,
          address: client.address || "",
          city: client.city || "",
          postalCode: client.postalCode || "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/clients/${clientId}`)}
        isLoading={updateClient.isPending}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
