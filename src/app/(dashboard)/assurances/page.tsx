import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssurancesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assurances</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Gérez vos compagnies d&apos;assurance et réclamations
          </p>
        </div>
        <Button>+ Nouvelle compagnie</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compagnies d&apos;assurance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Aucune compagnie pour le moment. Ajoutez votre première compagnie d&apos;assurance !
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
