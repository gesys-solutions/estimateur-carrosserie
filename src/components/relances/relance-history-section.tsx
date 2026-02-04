/**
 * Section historique des relances sur la page devis
 */

"use client";

import { Calendar, Phone, Mail, MessageSquare, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { AddRelanceDialog } from "./add-relance-dialog";
import { useDevisRelances, type RelanceItem } from "@/hooks";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { RelanceTypeType } from "@/lib/validations/relance";
import { RelanceTypeLabels } from "@/lib/validations/relance";

const RELANCE_TYPE_ICONS: Record<RelanceTypeType, React.ReactNode> = {
  APPEL: <Phone className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  SMS: <MessageSquare className="h-4 w-4" />,
  VISITE: <MapPin className="h-4 w-4" />,
};

interface RelanceHistorySectionProps {
  devisId: string;
  devisNumber?: string;
}

function RelanceTimelineItem({ relance }: { relance: RelanceItem }) {
  const isCompleted = !!relance.completedAt;
  const hasNextFollowUp = !!relance.nextFollowUp;
  const nextFollowUpDate = relance.nextFollowUp ? new Date(relance.nextFollowUp) : null;
  const isOverdue = nextFollowUpDate && nextFollowUpDate < new Date() && !isCompleted;

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700 last:hidden" />

      {/* Icon */}
      <div
        className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center
          ${isCompleted
            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
      >
        {RELANCE_TYPE_ICONS[relance.type as RelanceTypeType]}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">
            {RelanceTypeLabels[relance.type as RelanceTypeType]}
          </span>
          <span className="text-xs text-zinc-500">
            par {relance.createdBy.fullName}
          </span>
          <span className="text-xs text-zinc-400">
            {formatDateTime(relance.createdAt)}
          </span>
          {isCompleted && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complété
            </Badge>
          )}
          {isOverdue && (
            <Badge variant="destructive">
              <Clock className="h-3 w-3 mr-1" />
              En retard
            </Badge>
          )}
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {relance.notes}
        </p>

        {relance.outcome && (
          <p className="text-sm text-green-600 dark:text-green-400">
            <span className="font-medium">Résultat:</span> {relance.outcome}
          </p>
        )}

        {hasNextFollowUp && !isCompleted && (
          <p className={`text-sm ${isOverdue ? "text-red-600" : "text-blue-600"}`}>
            <Calendar className="h-3 w-3 inline mr-1" />
            Prochaine relance prévue: {formatDate(relance.nextFollowUp!)}
          </p>
        )}
      </div>
    </div>
  );
}

export function RelanceHistorySection({
  devisId,
  devisNumber,
}: RelanceHistorySectionProps) {
  const { data, isLoading, error } = useDevisRelances(devisId);

  const relances = data?.data ?? [];
  const hasUpcomingFollowUp = relances.some(
    (r) => r.nextFollowUp && new Date(r.nextFollowUp) > new Date() && !r.completedAt
  );
  const hasOverdue = relances.some(
    (r) => r.nextFollowUp && new Date(r.nextFollowUp) < new Date() && !r.completedAt
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-zinc-500" />
            <CardTitle className="text-lg">Historique des relances</CardTitle>
            {hasUpcomingFollowUp && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Relance planifiée
              </Badge>
            )}
            {hasOverdue && (
              <Badge variant="destructive">
                Suivi en retard
              </Badge>
            )}
          </div>
          <AddRelanceDialog devisId={devisId} devisNumber={devisNumber} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error.message}</p>
        ) : relances.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">
            Aucune relance enregistrée pour ce devis.
          </p>
        ) : (
          <div className="mt-2">
            {relances.map((relance) => (
              <RelanceTimelineItem key={relance.id} relance={relance} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
