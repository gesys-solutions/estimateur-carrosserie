import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, DollarSign, Clock } from "lucide-react";

// Mock data for dashboard
const stats = [
  {
    title: "Devis en cours",
    value: "12",
    description: "4 en négociation",
    icon: FileText,
  },
  {
    title: "Clients actifs",
    value: "48",
    description: "+3 ce mois",
    icon: Users,
  },
  {
    title: "Ventes du mois",
    value: "24 350 $",
    description: "+12% vs mois dernier",
    icon: DollarSign,
  },
  {
    title: "Délai moyen",
    value: "4.2 jours",
    description: "De soumission à approbation",
    icon: Clock,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue dans EstimPro. Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Devis récents</CardTitle>
            <CardDescription>Les 5 derniers devis créés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">EST-2026-000{i}</p>
                    <p className="text-sm text-muted-foreground">Client Demo {i}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(1500 + i * 200).toFixed(2)} $</p>
                    <p className="text-xs text-muted-foreground">Brouillon</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Négociations en cours</CardTitle>
            <CardDescription>Devis en attente de réponse assureur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">EST-2026-0042</p>
                  <p className="text-sm text-muted-foreground">Intact Assurance</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">3 250,00 $</p>
                  <p className="text-xs text-yellow-600">En attente</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">EST-2026-0038</p>
                  <p className="text-sm text-muted-foreground">Desjardins</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">1 890,00 $</p>
                  <p className="text-xs text-green-600">Contre-offre reçue</p>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                2 négociations actives
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
