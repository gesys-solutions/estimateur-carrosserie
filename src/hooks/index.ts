/**
 * Hooks barrel export
 */

export { useCurrentUser, type CurrentUser } from "./use-current-user";
export { useDebounce } from "./use-debounce";

// Re-export with explicit names to avoid conflicts
export {
  useClients,
  useClient,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  clientKeys,
  vehicleKeys,
  type ClientListItem,
  type ClientDetail,
  type VehicleListItem,
  type ClientDevisListItem,
} from "./clients";

export {
  useDevisList,
  useDevis,
  useCreateDevis,
  useUpdateDevis,
  useDeleteDevis,
  useAddDevisItem,
  useUpdateDevisItem,
  useDeleteDevisItem,
  useSendDevis,
  useChangeDevisStatus,
  devisKeys,
  type DevisListItem,
  type DevisDetail,
  type DevisItem,
} from "./devis";

export {
  useRelancesList,
  useDevisRelances,
  useCreateRelance,
  useUpdateRelance,
  useDeleteRelance,
  useMarkDevisLost,
  relanceKeys,
  type RelanceItem,
  type DevisToFollow,
  type RelancesStats,
} from "./relances";

export {
  useLeads,
  useLeadsCount,
  leadKeys,
  type LeadItem,
  type LeadsResponse,
} from "./leads";

export {
  useLostReport,
  reportKeys,
  type LostReportData,
  type LostReportSummary,
  type LostReasonBreakdown,
  type LostDevisItem,
} from "./reports";
