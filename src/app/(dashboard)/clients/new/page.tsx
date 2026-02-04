"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients";
import { useCreateClient } from "@/hooks/clients";
import type { ClientFormData } from "@/lib/validations/client";

export default function NewClientPage() {
  const router = useRouter();
  const createClient = useCreateClient();

  const handleSubmit = async (data: ClientFormData) => {
    try {
      const result = await createClient.mutateAsync(data);
      toast.success("Client créé avec succès");
      router.push(`/clients/${result.data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nouveau client</h1>
          <p className="text-zinc-500">Créez une nouvelle fiche client</p>
        </div>
      </div>

      <ClientForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/clients")}
        isLoading={createClient.isPending}
      />
    </div>
  );
}
