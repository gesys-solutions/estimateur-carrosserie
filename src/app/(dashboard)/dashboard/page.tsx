import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {title}
        </CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Bienvenue ! Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Devis du jour"
          value="12"
          description="+2 par rapport à hier"
          icon="📋"
        />
        <StatCard
          title="Ventes du jour"
          value="$15,420"
          description="Objectif: $18,000"
          icon="💰"
        />
        <StatCard
          title="En attente"
          value="8"
          description="Devis à suivre"
          icon="⏳"
        />
        <StatCard
          title="Taux de conversion"
          value="68%"
          description="+5% ce mois"
          icon="📈"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Derniers devis</CardTitle>
            <CardDescription>Les 5 derniers devis créés</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Aucun devis pour le moment. Créez votre premier devis !
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relances à faire</CardTitle>
            <CardDescription>Clients à contacter aujourd&apos;hui</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Aucune relance prévue pour aujourd&apos;hui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
