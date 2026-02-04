# EPIC-006: Dashboard & Reporting

## Description

Tableau de bord en temps réel pour les managers et estimateurs : ventes du jour, KPIs de performance, répartition par statut, et vue production. Permet de piloter l'activité de l'atelier d'un coup d'œil.

## Acceptance Criteria

- [ ] Dashboard avec ventes du jour (montant total approved)
- [ ] Compteurs visuels par statut de dossier
- [ ] KPIs par estimateur (devis créés, taux conversion)
- [ ] Tableau de production (dossiers en cours)
- [ ] Vue adaptée au rôle (estimateur: ses KPIs, manager: équipe)
- [ ] Données rafraîchies régulièrement

## Dependencies

- **EPIC-001:** Foundation
- **EPIC-002:** Auth & Users
- **EPIC-004:** Gestion des Devis (données à afficher)
- **EPIC-005:** Gestion des Assurances (stats par assureur optionnel)

## Technical Notes

- API endpoints dédiés pour agrégations
- TanStack Query avec polling ou invalidation
- Graphiques: Recharts ou Chart.js
- Performance: queries optimisées avec indexes

## Related PRD Requirements

- FR-016: Ventes du jour
- FR-017: Devis en cours par statut
- US-601, US-602, US-603, US-604

---

## Stories

### Story 1: API Statistiques Dashboard

- **ID:** EPIC-006-S01
- **Estimate:** L
- **Description:** Créer les endpoints API pour les métriques du dashboard.
- **Acceptance Criteria:**
  - [ ] `GET /api/dashboard/stats` — Stats globales tenant
  - [ ] Retourne: ventesJour, devisEnCours, devisApprouves, totalMoisEnCours
  - [ ] `GET /api/dashboard/by-status` — Compteurs par statut
  - [ ] `GET /api/dashboard/by-estimator` — Stats par estimateur (manager only)
  - [ ] Paramètre date optionnel (default: aujourd'hui)
  - [ ] Tenant isolation
  - [ ] Cache/performance optimisée

### Story 2: API KPIs Estimateur

- **ID:** EPIC-006-S02
- **Estimate:** M
- **Description:** Endpoint pour les KPIs personnels d'un estimateur.
- **Acceptance Criteria:**
  - [ ] `GET /api/dashboard/my-kpis` — KPIs de l'utilisateur courant
  - [ ] Retourne: devisCrees (jour/semaine/mois), tauxConversion, montantTotal
  - [ ] Comparaison période précédente (+/- %)
  - [ ] Basé sur createdById des devis

### Story 3: Page Dashboard Principal

- **ID:** EPIC-006-S03
- **Estimate:** L
- **Description:** Interface du tableau de bord principal.
- **Acceptance Criteria:**
  - [ ] Route `/dashboard` (page d'accueil après login)
  - [ ] Cards KPIs: Ventes du jour, Devis en cours, Taux conversion
  - [ ] Graphique: Compteurs par statut (bar chart ou donut)
  - [ ] Rafraîchissement auto (polling 60s) ou bouton refresh
  - [ ] Responsive (mobile friendly)
  - [ ] Loading skeletons

### Story 4: Widget Ventes du Jour

- **ID:** EPIC-006-S04
- **Estimate:** M
- **Description:** Composant affichant le total des ventes approuvées du jour.
- **Acceptance Criteria:**
  - [ ] Card avec montant en gros
  - [ ] Comparaison vs hier (+/- %)
  - [ ] Icône ou couleur selon tendance
  - [ ] Tooltip avec détails (nombre de devis)

### Story 5: Widget Compteurs par Statut

- **ID:** EPIC-006-S05
- **Estimate:** M
- **Description:** Visualisation des dossiers par statut.
- **Acceptance Criteria:**
  - [ ] Compteur pour chaque statut pertinent
  - [ ] Format: icône + nombre + label
  - [ ] Couleurs cohérentes avec badges statut
  - [ ] Clic → filtre la liste des devis par ce statut
  - [ ] Focus sur: DRAFT, SUBMITTED, NEGOTIATION, IN_REPAIR, READY

### Story 6: Section KPIs Estimateur

- **ID:** EPIC-006-S06
- **Estimate:** M
- **Description:** Section affichant les performances personnelles de l'estimateur.
- **Acceptance Criteria:**
  - [ ] Visible pour tous les rôles (mes stats)
  - [ ] Devis créés: jour, semaine, mois
  - [ ] Taux de conversion (approved / created)
  - [ ] Montant total vendu ce mois
  - [ ] Tendance vs mois précédent

### Story 7: Tableau Production

- **ID:** EPIC-006-S07
- **Estimate:** L
- **Description:** Liste des dossiers en cours (in_repair, ready) pour le suivi production.
- **Acceptance Criteria:**
  - [ ] Tableau filtré: statuts IN_REPAIR et READY
  - [ ] Colonnes: référence, client, véhicule, estimateur, jours en atelier, montant
  - [ ] Tri par date d'entrée en atelier
  - [ ] Alerte visuelle si >X jours
  - [ ] Actions rapides: Voir, Changer statut
  - [ ] Pagination si beaucoup de dossiers

### Story 8: Vue Manager — Performance Équipe

- **ID:** EPIC-006-S08
- **Estimate:** L
- **Description:** Dashboard étendu pour les managers avec vue équipe.
- **Acceptance Criteria:**
  - [ ] Visible uniquement pour MANAGER et ADMIN
  - [ ] Tableau comparatif des estimateurs
  - [ ] Colonnes: nom, devis créés, taux conversion, montant, en cours
  - [ ] Tri par métrique
  - [ ] Graphique comparatif (bar chart)
  - [ ] Période sélectionnable (semaine, mois, trimestre)

### Story 9: Graphique Tendance Ventes

- **ID:** EPIC-006-S09
- **Estimate:** M
- **Description:** Graphique montrant l'évolution des ventes sur une période.
- **Acceptance Criteria:**
  - [ ] Line chart ou area chart
  - [ ] Axes: date (X), montant (Y)
  - [ ] Période: 7 derniers jours par défaut
  - [ ] Option: 30 jours, 90 jours
  - [ ] Tooltip avec détails par jour
  - [ ] Bibliothèque: Recharts

### Story 10: API Tendances

- **ID:** EPIC-006-S10
- **Estimate:** M
- **Description:** Endpoint pour les données de tendance (graphique).
- **Acceptance Criteria:**
  - [ ] `GET /api/dashboard/trends` — Données par jour
  - [ ] Paramètres: startDate, endDate
  - [ ] Retourne: array de { date, amount, count }
  - [ ] Groupement par jour
  - [ ] Performance optimisée (indexes sur date)

---

## Estimation Summary

| Size | Count | Stories |
|------|-------|---------|
| S | 0 | — |
| M | 6 | S02, S04, S05, S06, S09, S10 |
| L | 4 | S01, S03, S07, S08 |

**Total: 10 stories**

---

*EPIC créé par John (PM) — BMAD Method*  
*Projet: EstimPro (estimateur-carrosserie)*  
*Date: 2026-02-04*
