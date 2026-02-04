import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RelancesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relances</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Suivez les devis non convertis et planifiez vos relances
          </p>
        </div>
        <Button>+ Nouvelle relance</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Devis à relancer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Aucune relance à faire pour le moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
