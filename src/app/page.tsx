import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, BarChart3, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">EP</span>
            </div>
            <span className="text-xl font-bold">EstimPro</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/login">
              <Button>Commencer</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Gérez vos devis de carrosserie{" "}
              <span className="text-primary">efficacement</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              EstimPro simplifie la gestion de vos devis, clients et négociations avec les
              assureurs. Une solution complète pour les ateliers de carrosserie.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Essai gratuit
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Voir la démo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Tout ce dont vous avez besoin
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <FileText className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Devis rapides</CardTitle>
                  <CardDescription>
                    Créez des devis professionnels en quelques clics avec calcul automatique des
                    taxes.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Gestion clients</CardTitle>
                  <CardDescription>
                    Centralisez les informations de vos clients et leur historique de véhicules.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Négociations</CardTitle>
                  <CardDescription>
                    Suivez vos négociations avec les assureurs et gardez un historique complet.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Tableau de bord</CardTitle>
                  <CardDescription>
                    Visualisez vos performances avec des rapports détaillés et KPIs en temps réel.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <Card className="mx-auto max-w-2xl bg-primary text-primary-foreground">
              <CardContent className="py-12">
                <h2 className="mb-4 text-3xl font-bold">Prêt à simplifier votre gestion?</h2>
                <p className="mb-6 text-primary-foreground/80">
                  Rejoignez les ateliers qui font confiance à EstimPro.
                </p>
                <Link href="/login">
                  <Button size="lg" variant="secondary">
                    Commencer maintenant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">EP</span>
            </div>
            <span className="font-semibold">EstimPro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EstimPro. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Solution de gestion pour carrosseries automobiles
          </p>
        </div>
      </footer>
    </div>
  );
}
