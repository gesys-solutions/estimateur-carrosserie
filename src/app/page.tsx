import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
      <main className="flex flex-col items-center gap-8 text-center max-w-2xl">
        {/* Logo / Title */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Estimateur Carrosserie
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Gestion professionnelle des devis, clients et assurances
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Devis</CardTitle>
              <CardDescription>
                Créez des devis précis en quelques minutes
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👥 Clients</CardTitle>
              <CardDescription>
                Gérez vos clients et leurs véhicules
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏢 Assurances</CardTitle>
              <CardDescription>
                Négociations et suivi des réclamations
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Dashboard</CardTitle>
              <CardDescription>
                Tableau de bord ventes et production
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔔 Relances</CardTitle>
              <CardDescription>
                Suivi des devis non convertis
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📈 Rapports</CardTitle>
              <CardDescription>
                Analyse de rentabilité par assureur
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="flex gap-4 mt-8">
          <Button asChild size="lg">
            <Link href="/login">
              Se connecter
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">
              Voir le dashboard
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-8">
          © 2026 Gesys Solutions — Tous droits réservés
        </p>
      </main>
    </div>
  );
}
