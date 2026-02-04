import { ClientList } from "@/components/clients";

export default function ClientsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Gérez vos clients et leurs véhicules
        </p>
      </div>

      <ClientList />
    </div>
  );
}
