/**
 * Lead Card Component
 * Displays a lead (unconverted devis) with actions
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MessageSquare,
  XCircle,
  ExternalLink,
  Clock,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { LeadItem } from "@/hooks";

interface LeadCardProps {
  lead: LeadItem;
  onAddRelance: (lead: LeadItem) => void;
  onMarkLost: (lead: LeadItem) => void;
}

const statusLabels: Record<string, string> = {
  BROUILLON: "Brouillon",
  ENVOYE: "Envoyé",
  EN_NEGOCIATION: "En négociation",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const priorityLabels: Record<string, string> = {
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

export function LeadCard({ lead, onAddRelance, onMarkLost }: LeadCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Link
              href={`/devis/${lead.id}`}
              className="hover:underline"
            >
              <CardTitle className="text-base">
                {lead.client.name}
              </CardTitle>
            </Link>
            <p className="text-sm text-zinc-500">{lead.devisNumber}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="outline">
              {statusLabels[lead.status] ?? lead.status}
            </Badge>
            <Badge className={priorityColors[lead.priority]}>
              {priorityLabels[lead.priority]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vehicle info */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {lead.vehicle.description}
          {lead.vehicle.licensePlate && ` • ${lead.vehicle.licensePlate}`}
        </p>

        {/* Amount */}
        <div className="text-lg font-semibold">
          {new Intl.NumberFormat("fr-CA", {
            style: "currency",
            currency: "CAD",
          }).format(lead.amount)}
        </div>

        {/* Age and last contact */}
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{lead.daysSinceCreation} jours</span>
          </div>
          {lead.lastRelance && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(lead.lastRelance.date), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Last note */}
        {lead.lastRelance && (
          <p className="text-sm text-zinc-500 line-clamp-2 bg-zinc-50 dark:bg-zinc-800/50 rounded p-2">
            {lead.lastRelance.notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {lead.client.phone && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={`tel:${lead.client.phone}`}>
                <Phone className="h-4 w-4 mr-1" />
                Appeler
              </a>
            </Button>
          )}
          
          {lead.client.email && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={`mailto:${lead.client.email}`}>
                <Mail className="h-4 w-4 mr-1" />
                Email
              </a>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddRelance(lead)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Note
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => onMarkLost(lead)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Perdu
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="ml-auto"
          >
            <Link href={`/devis/${lead.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
