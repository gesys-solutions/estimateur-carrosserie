import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevisPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Créez et gérez vos devis de réparation
          </p>
        </div>
        <Button>+ Nouveau devis</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des devis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Aucun devis pour le moment. Créez votre premier devis !
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
