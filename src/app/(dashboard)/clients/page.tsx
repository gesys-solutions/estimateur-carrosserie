import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ClientsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Gérez vos clients et leurs véhicules
          </p>
        </div>
        <Button>+ Nouveau client</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Aucun client pour le moment. Ajoutez votre premier client !
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
