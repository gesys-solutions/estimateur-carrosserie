import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a localized format
 */
export function formatDate(dateString: string | Date, formatStr = "d MMM yyyy"): string {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return format(date, formatStr, { locale: fr });
}

/**
 * Format a date string to include time
 */
export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return format(date, "d MMM yyyy 'à' HH:mm", { locale: fr });
}

/**
 * Format currency (Canadian dollars)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  // Remove non-digits
  const digits = phone.replace(/\D/g, "");
  
  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return as-is if not 10 digits
  return phone;
}
