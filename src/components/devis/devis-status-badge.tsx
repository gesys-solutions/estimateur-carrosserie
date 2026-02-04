/**
 * Devis Status Badge Component
 */

"use client";

import { cn } from "@/lib/utils";
import { DevisStatusLabels, DevisStatusColors, DevisStatusType } from "@/lib/validations/devis";

interface DevisStatusBadgeProps {
  status: DevisStatusType;
  className?: string;
}

export function DevisStatusBadge({ status, className }: DevisStatusBadgeProps) {
  const label = DevisStatusLabels[status] || status;
  const colorClass = DevisStatusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
