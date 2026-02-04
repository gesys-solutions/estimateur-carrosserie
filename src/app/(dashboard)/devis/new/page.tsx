/**
 * Page Création de Devis
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ArrowLeft, Search } from "lucide-react";
import { useClients, useVehicles, ClientListItem, VehicleListItem } from "@/hooks/clients";
import { useCreateDevis } from "@/hooks/devis";
import { devisSchema, DevisFormData } from "@/lib/validations/devis";
import { useDebounce } from "@/hooks/use-debounce";

export default function NewDevisPage() {
  const router = useRouter();
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(null);
  const [showClientList, setShowClientList] = useState(false);

  const debouncedSearch = useDebounce(clientSearch, 300);

  const { data: clientsData, isLoading: isLoadingClients } = useClients({
    q: debouncedSearch || undefined,
    limit: 10,
  });

  const { data: vehiclesData, isLoading: isLoadingVehicles } = useVehicles(
    selectedClient?.id || ""
  );

  const { mutate: createDevis, isPending: isCreating } = useCreateDevis();

  const form = useForm<DevisFormData>({
    resolver: zodResolver(devisSchema),
    defaultValues: {
      clientId: "",
      vehicleId: "",
      notes: "",
    },
  });

  // When client changes, reset vehicle
  useEffect(() => {
    if (selectedClient) {
      form.setValue("clientId", selectedClient.id);
      form.setValue("vehicleId", "");
    }
  }, [selectedClient, form]);

  const handleClientSelect = (client: ClientListItem) => {
    setSelectedClient(client);
    setClientSearch(client.fullName);
    setShowClientList(false);
  };

  const handleSubmit = (data: DevisFormData) => {
    createDevis(data, {
      onSuccess: (response) => {
        toast.success("Devis créé avec succès");
        router.push(`/devis/${response.data.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const vehicles = vehiclesData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/devis">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouveau devis</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Créez un nouveau devis de réparation
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
                <CardDescription>
                  Recherchez et sélectionnez un client existant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      placeholder="Rechercher par nom ou téléphone..."
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setShowClientList(true);
                        if (!e.target.value) setSelectedClient(null);
                      }}
                      onFocus={() => setShowClientList(true)}
                      className="pl-9"
                    />
                  </div>

                  {/* Client dropdown */}
                  {showClientList && clientSearch && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg dark:bg-zinc-900">
                      {isLoadingClients ? (
                        <div className="p-4 text-center">
                          <Spinner className="h-5 w-5 mx-auto" />
                        </div>
                      ) : clientsData?.data.length === 0 ? (
                        <div className="p-4 text-center text-zinc-500">
                          Aucun client trouvé
                          <Link href="/clients/new" className="block mt-2">
                            <Button variant="link" size="sm">
                              Créer un nouveau client
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <ul className="max-h-60 overflow-auto py-1">
                          {clientsData?.data.map((client) => (
                            <li
                              key={client.id}
                              onClick={() => handleClientSelect(client)}
                              className="cursor-pointer px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <p className="font-medium">{client.fullName}</p>
                              <p className="text-sm text-zinc-500">{client.phone}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {selectedClient && (
                  <div className="rounded-md bg-zinc-50 p-4 dark:bg-zinc-800/50">
                    <p className="font-medium">{selectedClient.fullName}</p>
                    <p className="text-sm text-zinc-500">{selectedClient.phone}</p>
                    {selectedClient.email && (
                      <p className="text-sm text-zinc-500">{selectedClient.email}</p>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="clientId"
                  render={() => (
                    <FormItem className="hidden">
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Vehicle Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Véhicule</CardTitle>
                <CardDescription>
                  Sélectionnez le véhicule du client
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedClient ? (
                  <p className="text-sm text-zinc-500 italic">
                    Sélectionnez d&apos;abord un client
                  </p>
                ) : isLoadingVehicles ? (
                  <div className="flex justify-center py-4">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-zinc-500 mb-2">
                      Ce client n&apos;a aucun véhicule enregistré
                    </p>
                    <Link href={`/clients/${selectedClient.id}`}>
                      <Button variant="outline" size="sm">
                        Ajouter un véhicule
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Véhicule</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un véhicule" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicles.map((vehicle: VehicleListItem) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                <div>
                                  <span className="font-medium">
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                  </span>
                                  {vehicle.licensePlate && (
                                    <span className="ml-2 text-zinc-500">
                                      ({vehicle.licensePlate})
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch("vehicleId") && vehicles.length > 0 && (
                  <div className="rounded-md bg-zinc-50 p-4 dark:bg-zinc-800/50">
                    {(() => {
                      const vehicle = vehicles.find((v: VehicleListItem) => v.id === form.watch("vehicleId"));
                      if (!vehicle) return null;
                      return (
                        <>
                          <p className="font-medium">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          {vehicle.color && (
                            <p className="text-sm text-zinc-500">Couleur: {vehicle.color}</p>
                          )}
                          {vehicle.licensePlate && (
                            <p className="text-sm text-zinc-500 font-mono">
                              Plaque: {vehicle.licensePlate}
                            </p>
                          )}
                          {vehicle.vin && (
                            <p className="text-sm text-zinc-500 font-mono">
                              VIN: {vehicle.vin}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
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
            <Link href="/devis">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isCreating || !selectedClient || !form.watch("vehicleId")}
            >
              {isCreating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Création...
                </>
              ) : (
                "Créer le devis"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
