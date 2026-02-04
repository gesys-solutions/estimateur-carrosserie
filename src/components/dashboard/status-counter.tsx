/**
 * Status Counter Card
 * Displays count for a specific status with color coding
 */

"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatusCounterProps {
  status: string;
  label: string;
  count: number;
  icon: React.ReactNode;
  href?: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  BROUILLON: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600",
  ENVOYE: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  EN_NEGOCIATION: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  ACCEPTE: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  REFUSE: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  EN_REPARATION: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  TERMINE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
};

export function StatusCounter({
  status,
  label,
  count,
  icon,
  href,
  className,
}: StatusCounterProps) {
  const colorClass = statusColors[status] || statusColors.BROUILLON;

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border transition-all",
        colorClass,
        href && "hover:shadow-md cursor-pointer",
        className
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-sm truncate">{label}</div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function StatusCounterGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", className)}>
      {children}
    </div>
  );
}
