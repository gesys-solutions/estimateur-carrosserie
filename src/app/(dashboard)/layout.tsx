import Link from "next/link";
import { Button } from "@/components/ui/button";

// Force dynamic rendering for all dashboard routes (auth required)
export const dynamic = 'force-dynamic';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Clients", href: "/clients", icon: "👥" },
  { label: "Devis", href: "/devis", icon: "📋" },
  { label: "Assurances", href: "/assurances", icon: "🏢" },
  { label: "Relances", href: "/relances", icon: "🔔" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <div className="mb-8">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            🚗 Estimateur
          </Link>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Déconnexion</Link>
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
