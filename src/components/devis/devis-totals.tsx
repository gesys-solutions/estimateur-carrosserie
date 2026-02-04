/**
 * Devis Totals Component
 */

"use client";

import { formatCurrency } from "@/lib/utils";
import { TPS_RATE, TVQ_RATE } from "@/lib/validations/devis";

interface DevisTotalsProps {
  subtotal: number;
  tps: number;
  tvq: number;
  total: number;
  className?: string;
}

export function DevisTotals({ subtotal, tps, tvq, total, className }: DevisTotalsProps) {
  return (
    <div className={className}>
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Sous-total</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">TPS ({(TPS_RATE * 100).toFixed(0)}%)</span>
          <span className="font-medium">{formatCurrency(tps)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">TVQ ({(TVQ_RATE * 100).toFixed(3)}%)</span>
          <span className="font-medium">{formatCurrency(tvq)}</span>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-semibold text-lg">Total TTC</span>
            <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
