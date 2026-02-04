/**
 * Page Liste des Devis
 */

import { DevisList } from "@/components/devis";

export default function DevisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Créez et gérez vos devis de réparation
        </p>
      </div>

      <DevisList />
    </div>
  );
}
