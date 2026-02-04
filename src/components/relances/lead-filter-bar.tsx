/**
 * Lead Filter Bar Component
 * Filters for the leads list
 */

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, AlertTriangle, Clock, CheckCircle } from "lucide-react";

export type PriorityFilter = "all" | "high" | "medium" | "low";
export type StatusFilter = "all" | "BROUILLON" | "ENVOYE" | "EN_NEGOCIATION";
export type AgeFilter = "all" | "0-7" | "7-14" | "14+";

interface LeadFilterBarProps {
  priority: PriorityFilter;
  status: StatusFilter;
  age: AgeFilter;
  onPriorityChange: (value: PriorityFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
  onAgeChange: (value: AgeFilter) => void;
  counts: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function LeadFilterBar({
  priority,
  status,
  age,
  onPriorityChange,
  onStatusChange,
  onAgeChange,
  counts,
}: LeadFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Filtres:
        </span>
      </div>

      {/* Priority buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={priority === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onPriorityChange("all")}
        >
          Tous
          <Badge variant="secondary" className="ml-2">
            {counts.total}
          </Badge>
        </Button>
        <Button
          variant={priority === "high" ? "default" : "outline"}
          size="sm"
          onClick={() => onPriorityChange("high")}
          className={priority !== "high" ? "text-red-600 border-red-200" : ""}
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Haute
          <Badge variant="secondary" className="ml-2">
            {counts.high}
          </Badge>
        </Button>
        <Button
          variant={priority === "medium" ? "default" : "outline"}
          size="sm"
          onClick={() => onPriorityChange("medium")}
          className={priority !== "medium" ? "text-yellow-600 border-yellow-200" : ""}
        >
          <Clock className="h-4 w-4 mr-1" />
          Moyenne
          <Badge variant="secondary" className="ml-2">
            {counts.medium}
          </Badge>
        </Button>
        <Button
          variant={priority === "low" ? "default" : "outline"}
          size="sm"
          onClick={() => onPriorityChange("low")}
          className={priority !== "low" ? "text-green-600 border-green-200" : ""}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Basse
          <Badge variant="secondary" className="ml-2">
            {counts.low}
          </Badge>
        </Button>
      </div>

      {/* Status select */}
      <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="BROUILLON">Brouillon</SelectItem>
          <SelectItem value="ENVOYE">Envoyé</SelectItem>
          <SelectItem value="EN_NEGOCIATION">En négociation</SelectItem>
        </SelectContent>
      </Select>

      {/* Age select */}
      <Select value={age} onValueChange={(v) => onAgeChange(v as AgeFilter)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Ancienneté" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes</SelectItem>
          <SelectItem value="0-7">{"< 7 jours"}</SelectItem>
          <SelectItem value="7-14">7-14 jours</SelectItem>
          <SelectItem value="14+">{"> 14 jours"}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
