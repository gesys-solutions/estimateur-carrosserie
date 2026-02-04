/**
 * Relances Page
 * Lead tracking and follow-up management
 */

"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  LeadCard,
  LeadFilterBar,
  AddRelanceDialog,
  MarkLostDialog,
  type PriorityFilter,
  type StatusFilter,
  type AgeFilter,
} from "@/components/relances";
import { useLeads, type LeadItem } from "@/hooks";
import { Download, Users, Clock, AlertTriangle, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function RelancesPage() {
  // Filters state
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [age, setAge] = useState<AgeFilter>("all");

  // Dialog states
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [showAddRelance, setShowAddRelance] = useState(false);
  const [showMarkLost, setShowMarkLost] = useState(false);

  // Fetch leads
  const { data, isLoading, error } = useLeads({
    status: status !== "all" ? status : undefined,
    priority: priority !== "all" ? priority : undefined,
  });

  // Filter leads by age locally
  const filteredLeads = useMemo(() => {
    if (!data?.items) return [];
    
    let leads = data.items;

    // Apply age filter
    if (age !== "all") {
      leads = leads.filter((lead) => {
        switch (age) {
          case "0-7":
            return lead.daysSinceCreation < 7;
          case "7-14":
            return lead.daysSinceCreation >= 7 && lead.daysSinceCreation <= 14;
          case "14+":
            return lead.daysSinceCreation > 14;
          default:
            return true;
        }
      });
    }

    return leads;
  }, [data?.items, age]);

  // Calculate counts for filter bar
  const counts = useMemo(() => {
    if (!data?.items) return { total: 0, high: 0, medium: 0, low: 0 };
    return {
      total: data.items.length,
      high: data.items.filter((l) => l.priority === "high").length,
      medium: data.items.filter((l) => l.priority === "medium").length,
      low: data.items.filter((l) => l.priority === "low").length,
    };
  }, [data?.items]);

  // Handle actions
  const handleAddRelance = (lead: LeadItem) => {
    setSelectedLead(lead);
    setShowAddRelance(true);
  };

  const handleMarkLost = (lead: LeadItem) => {
    setSelectedLead(lead);
    setShowMarkLost(true);
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/v1/leads/export");
      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Export téléchargé");
    } catch {
      toast.error("Erreur lors de l'export");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relances</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Suivez les devis non convertis et planifiez vos relances
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total leads
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.count ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              À relancer
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.needsFollowUpCount ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Priorité haute
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {counts.high}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Brouillons
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.byStatus?.brouillon ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <LeadFilterBar
        priority={priority}
        status={status}
        age={age}
        onPriorityChange={setPriority}
        onStatusChange={setStatus}
        onAgeChange={setAge}
        counts={counts}
      />

      {/* Leads List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center text-red-500">
            Erreur lors du chargement des leads
          </CardContent>
        </Card>
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
            <h3 className="text-lg font-medium">Aucun lead à afficher</h3>
            <p className="text-zinc-500 mt-1">
              {priority !== "all" || status !== "all" || age !== "all"
                ? "Essayez d'ajuster vos filtres"
                : "Tous vos devis sont convertis ou en cours 🎉"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {filteredLeads.length} lead{filteredLeads.length > 1 ? "s" : ""} affiché{filteredLeads.length > 1 ? "s" : ""}
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onAddRelance={handleAddRelance}
                onMarkLost={handleMarkLost}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddRelanceDialog
        lead={selectedLead}
        open={showAddRelance}
        onOpenChange={setShowAddRelance}
      />

      <MarkLostDialog
        lead={selectedLead}
        open={showMarkLost}
        onOpenChange={setShowMarkLost}
      />
    </div>
  );
}
