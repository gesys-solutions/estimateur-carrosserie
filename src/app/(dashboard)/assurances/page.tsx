import { AssuranceList } from "@/components/assurances";

export default function AssurancesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assurances</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Gérez vos compagnies d&apos;assurance et leurs coordonnées
        </p>
      </div>

      <AssuranceList />
    </div>
  );
}
