# Epic 6: Dashboard

**Projet:** EstimPro (estimateur-carrosserie)  
**Date:** 2026-02-04  
**Auteur:** John (Product Manager — BMAD)  
**Version:** 1.0  

---

## Objectif

Implémenter le tableau de bord principal : KPIs en temps réel, ventes du jour, compteurs par statut, graphiques de performance, et aperçu de l'activité. Le dashboard doit permettre aux managers d'avoir une vision claire de la performance de l'équipe.

**Valeur livrée :** À la fin de cet Epic, les managers et estimateurs ont une vue synthétique de leur activité avec les métriques clés actualisées en temps réel.

---

## Requirements couverts

- **FR-016:** Ventes du jour (montant total des devis approved aujourd'hui)
- **FR-017:** Devis en cours par statut (compteurs visuels)
- **US-601, US-602, US-603, US-604**

---

## Dépendances

- **Epic 1: Foundation** — Structure projet
- **Epic 2: Auth & Users** — Rôles (différencier vue estimateur/manager)
- **Epic 4: Devis** — Données pour les statistiques

---

## Stories

---

### Story 6.1: API Dashboard - Statistiques du jour

**Epic:** Dashboard  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want an API endpoint for today's statistics so that the dashboard can display real-time data.

#### Acceptance Criteria
- [ ] Route `GET /api/v1/dashboard/today`
- [ ] Retourne: 
  - Nombre de devis créés aujourd'hui
  - Montant total des devis approved aujourd'hui
  - Nombre de devis en attente de réponse
  - Nombre de véhicules livrés aujourd'hui
- [ ] Filtrage par tenant automatique
- [ ] Filtrage par userId si role=ESTIMATOR (ses propres stats)
- [ ] Performances < 500ms

#### Technical Notes
- Date du jour en UTC ou timezone configurée
- Aggrégations Prisma: `_count`, `_sum`
- Cache optionnel avec staleTime côté client

---

### Story 6.2: API Dashboard - Compteurs par statut

**Epic:** Dashboard  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want an API for status counts so that I can display visual counters.

#### Acceptance Criteria
- [ ] Route `GET /api/v1/dashboard/by-status`
- [ ] Retourne un objet avec count par statut:
  ```json
  { "DRAFT": 5, "SUBMITTED": 3, "NEGOTIATION": 2, "APPROVED": 8, ... }
  ```
- [ ] Exclure les statuts à 0 optionnellement
- [ ] Filtrage tenant + user selon rôle
- [ ] Performances < 300ms

#### Technical Notes
- GroupBy sur status avec count
- Retourner tous les statuts même si count = 0 pour cohérence UI

---

### Story 6.3: API Dashboard - Stats par estimateur

**Epic:** Dashboard  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want stats by estimator so that managers can compare performance.

#### Acceptance Criteria
- [ ] Route `GET /api/v1/dashboard/by-estimator`
- [ ] Accès: MANAGER et ADMIN uniquement
- [ ] Par estimateur: nom, nb devis créés, nb approved, montant total approved, taux conversion
- [ ] Période paramétrable: `?period=today|week|month`
- [ ] Tri par montant ou par taux de conversion

#### Technical Notes
- Taux conversion = approved / (total - draft) * 100
- Exclure les users inactifs
- Include firstName, lastName

---

### Story 6.4: Page Dashboard principale

**Epic:** Dashboard  
**Priority:** P0  
**Effort:** L  

#### Description
As a **user**, I want a dashboard homepage so that I can see key metrics at a glance.

#### Acceptance Criteria
- [ ] Route `/` après login affiche le dashboard
- [ ] Section "Aujourd'hui": 4 cartes KPI (Devis créés, Montant approved, En attente, Livrés)
- [ ] Section "Par statut": compteurs visuels avec icônes/couleurs
- [ ] Section "Derniers devis": tableau des 5 derniers devis
- [ ] Design responsive (cards empilées sur mobile)
- [ ] Refresh automatique toutes les 5 minutes (optionnel)
- [ ] État loading avec skeletons

#### Technical Notes
- Hooks: `useDashboardToday()`, `useDashboardByStatus()`, `useRecentEstimates()`
- Composants: StatsCard, StatusBadge, RecentEstimatesTable
- TanStack Query avec refetchInterval optionnel

---

### Story 6.5: Cartes KPI avec indicateurs

**Epic:** Dashboard  
**Priority:** P0  
**Effort:** M  

#### Description
As a **manager**, I want KPI cards with trend indicators so that I can quickly assess performance.

#### Acceptance Criteria
- [ ] 4 cartes principales:
  - Devis créés (aujourd'hui) avec comparaison hier
  - Montant approved (aujourd'hui) avec comparaison hier
  - Devis en négociation (warning si > 10)
  - Taux de conversion (semaine en cours vs semaine précédente)
- [ ] Flèche haut/bas avec couleur (vert positif, rouge négatif)
- [ ] Pourcentage de variation affiché
- [ ] Icônes distinctives par carte
- [ ] Clic sur carte → filtre la liste des devis

#### Technical Notes
- API doit retourner les valeurs actuelles ET précédentes
- Calcul variation: ((current - previous) / previous) * 100
- Gérer division par zéro

---

### Story 6.6: Compteurs par statut (visuel)

**Epic:** Dashboard  
**Priority:** P0  
**Effort:** S  

#### Description
As an **estimateur**, I want visual status counters so that I see at a glance where my estimates stand.

#### Acceptance Criteria
- [ ] Barre horizontale ou grid avec tous les statuts
- [ ] Chaque statut: icône + label + count
- [ ] Couleurs distinctives par statut:
  - DRAFT: gris
  - SUBMITTED: bleu
  - NEGOTIATION: jaune
  - APPROVED: vert clair
  - SIGNED: vert
  - IN_REPAIR: orange
  - READY: cyan
  - DELIVERED: vert foncé
  - CLOSED: gris foncé
  - LOST: rouge
- [ ] Clic sur un statut → filtre la liste des devis

#### Technical Notes
- Composant StatusCounter réutilisable
- Animation légère au hover
- Badge avec pulse si count > 0 et statut important (NEGOTIATION)

---

### Story 6.7: Tableau des devis récents

**Epic:** Dashboard  
**Priority:** P0  
**Effort:** S  

#### Description
As an **estimateur**, I want to see my recent estimates on the dashboard so that I can quickly access my work.

#### Acceptance Criteria
- [ ] Tableau des 5-10 derniers devis
- [ ] Colonnes: Numéro, Client, Véhicule, Statut, Montant, Date
- [ ] Clic sur ligne → fiche devis
- [ ] Lien "Voir tous les devis" en bas
- [ ] Filtré par utilisateur pour ESTIMATOR, tous pour MANAGER+
- [ ] Tri par date création décroissante

#### Technical Notes
- Réutiliser les composants de liste existants
- Compact mode (moins de padding, font plus petite)
- Pas de pagination, juste limite

---

### Story 6.8: Graphique évolution hebdomadaire

**Epic:** Dashboard  
**Priority:** P1  
**Effort:** M  

#### Description
As a **manager**, I want a weekly chart so that I can visualize trends over time.

#### Acceptance Criteria
- [ ] Graphique ligne ou barre pour les 7 derniers jours
- [ ] Métriques: nombre de devis créés, montant approved par jour
- [ ] Légende claire
- [ ] Tooltip au survol avec valeurs exactes
- [ ] Responsive (réduit sur mobile)
- [ ] API: GET `/api/v1/dashboard/weekly`

#### Technical Notes
- Utiliser Recharts (inclus dans shadcn charts)
- Données groupées par jour
- Gérer les jours sans données (afficher 0)

---

### Story 6.9: KPIs personnels (estimateur)

**Epic:** Dashboard  
**Priority:** P1  
**Effort:** S  

#### Description
As an **estimateur**, I want to see my personal KPIs so that I know my performance.

#### Acceptance Criteria
- [ ] Section "Ma performance" visible pour ESTIMATOR
- [ ] Métriques: 
  - Devis créés (ce mois)
  - Taux de conversion personnel
  - Montant total approved
  - Temps moyen par devis
- [ ] Comparaison avec moyenne de l'équipe (si disponible)
- [ ] Objectifs si définis (barre de progression)

#### Technical Notes
- API filtrée par userId
- Temps moyen = somme timeSpentMin / count
- Objectifs: future feature, placeholder pour l'instant

---

### Story 6.10: Dashboard responsive

**Epic:** Dashboard  
**Priority:** P0  
**Effort:** S  

#### Description
As a **user**, I want the dashboard to work on tablet so that I can check it from the workshop.

#### Acceptance Criteria
- [ ] Layout adaptatif: 
  - Desktop: grille 4 colonnes pour KPIs
  - Tablet: grille 2 colonnes
  - Mobile: stack vertical
- [ ] Graphiques réduisent gracieusement
- [ ] Tableau devient liste de cards sur mobile
- [ ] Touch-friendly (boutons assez grands)
- [ ] Testé sur iPad et tablette Android

#### Technical Notes
- Tailwind breakpoints: sm, md, lg, xl
- Container queries si nécessaire
- Tester avec Chrome DevTools device mode

---

## Résumé

| Story | Titre | Effort | Priority |
|-------|-------|--------|----------|
| 6.1 | API Dashboard - Stats du jour | S | P0 |
| 6.2 | API Dashboard - Compteurs par statut | S | P0 |
| 6.3 | API Dashboard - Stats par estimateur | S | P0 |
| 6.4 | Page Dashboard principale | L | P0 |
| 6.5 | Cartes KPI avec indicateurs | M | P0 |
| 6.6 | Compteurs par statut (visuel) | S | P0 |
| 6.7 | Tableau des devis récents | S | P0 |
| 6.8 | Graphique évolution hebdomadaire | M | P1 |
| 6.9 | KPIs personnels (estimateur) | S | P1 |
| 6.10 | Dashboard responsive | S | P0 |

**Total Stories:** 10  
**Effort estimé:** ~7-9 jours  

---

*Document créé par John (PM) — BMAD Method*
