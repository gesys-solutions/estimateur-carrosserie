# Epic 7: Suivi Leads

**Projet:** EstimPro (estimateur-carrosserie)  
**Date:** 2026-02-04  
**Auteur:** John (Product Manager — BMAD)  
**Version:** 1.0  

---

## Objectif

Implémenter le suivi des leads (devis non convertis) : liste des devis en attente depuis trop longtemps, système de relances avec notes, raisons de perte, et notifications pour éviter que les opportunités "tombent entre les craques".

**Valeur livrée :** À la fin de cet Epic, aucun devis ne sera oublié. Les estimateurs auront des rappels pour relancer les clients, et les managers pourront analyser les raisons de perte.

---

## Requirements couverts

- **FR-104:** Liste des devis non convertis (>X jours)
- **FR-105:** Système de relance avec date et notes
- **FR-106:** Raison de perte (dropdown + notes)
- **FR-109:** Alertes pour relances (préparation v1.1)
- **US-304 (indirectement):** Suivi des dossiers

---

## Dépendances

- **Epic 1: Foundation** — Structure projet
- **Epic 2: Auth & Users** — Authentification
- **Epic 4: Devis** — Devis et statuts

---

## Stories

---

### Story 7.1: API Liste des leads (devis non convertis)

**Epic:** Suivi Leads  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want an API to list unconverted estimates so that I can display them in a dedicated view.

#### Acceptance Criteria
- [ ] Route `GET /api/v1/leads`
- [ ] Retourne les devis avec statut DRAFT, SUBMITTED, ou NEGOTIATION
- [ ] Filtre par âge: `?minDays=7` (devis créés il y a > X jours)
- [ ] Tri par date création (plus ancien en premier)
- [ ] Include: client, vehicle, lastFollowUp (dernière note)
- [ ] Pagination standard
- [ ] Filtrage tenant + user selon rôle

#### Technical Notes
- Calcul âge: now - createdAt en jours
- lastFollowUp: dernière entrée dans la table FollowUp (à créer)
- Exclure les devis APPROVED, SIGNED, CLOSED, LOST

---

### Story 7.2: Page liste des leads

**Epic:** Suivi Leads  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to see a list of unconverted estimates so that I know which clients to follow up with.

#### Acceptance Criteria
- [ ] Route `/leads` accessible à tous les rôles
- [ ] Tableau avec colonnes: Numéro, Client, Véhicule, Statut, Âge (jours), Dernière relance, Montant
- [ ] Indicateur visuel pour âge:
  - Vert: < 7 jours
  - Jaune: 7-14 jours
  - Rouge: > 14 jours
- [ ] Filtrage par tranche d'âge (tabs ou dropdown)
- [ ] Clic sur ligne → modal de suivi ou fiche devis
- [ ] Bouton "Relancer" rapide

#### Technical Notes
- Calcul âge côté serveur dans la réponse API
- Badge couleur avec days depuis création
- Responsive: cards sur mobile

---

### Story 7.3: Modèle FollowUp (relances)

**Epic:** Suivi Leads  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want a FollowUp model so that I can track follow-up actions on estimates.

#### Acceptance Criteria
- [ ] Nouvelle table/modèle `FollowUp` dans Prisma
- [ ] Champs: id, estimateId, createdById, notes*, contactMethod, nextFollowUpDate, createdAt
- [ ] ContactMethod enum: PHONE, EMAIL, SMS, IN_PERSON, OTHER
- [ ] Relation: FollowUp belongsTo Estimate, User
- [ ] Migration créée et appliquée

#### Technical Notes
- Schema Prisma:
  ```prisma
  model FollowUp {
    id              String   @id @default(cuid())
    estimateId      String
    estimate        Estimate @relation(...)
    createdById     String
    createdBy       User     @relation(...)
    notes           String
    contactMethod   ContactMethod
    nextFollowUpDate DateTime?
    createdAt       DateTime @default(now())
  }
  ```

---

### Story 7.4: API CRUD Relances

**Epic:** Suivi Leads  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want CRUD operations for follow-ups so that estimators can log their actions.

#### Acceptance Criteria
- [ ] Route `GET /api/v1/estimates/:id/followups` — Historique des relances
- [ ] Route `POST /api/v1/estimates/:id/followups` — Ajouter une relance
- [ ] Champs requis: notes, contactMethod
- [ ] Champs optionnels: nextFollowUpDate
- [ ] createdById automatique depuis session
- [ ] Tri par date décroissante
- [ ] Pas de modification/suppression (historique immuable)

#### Technical Notes
- Similar à Negotiations mais focus sur les actions de relance
- nextFollowUpDate pour planifier la prochaine action

---

### Story 7.5: Interface de suivi (relance)

**Epic:** Suivi Leads  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to log follow-up actions so that I track my efforts to convert estimates.

#### Acceptance Criteria
- [ ] Modal ou section dédiée sur la fiche devis (onglet "Suivi")
- [ ] Historique des relances: date, méthode, notes, auteur
- [ ] Formulaire "Nouvelle relance":
  - Méthode de contact (dropdown)
  - Notes* (textarea)
  - Date prochaine relance (date picker, optionnel)
- [ ] Bouton "Enregistrer" sauvegarde et rafraîchit
- [ ] Badge sur la fiche devis si relance prévue passée

#### Technical Notes
- Timeline similaire aux négociations
- Alerte visuelle si nextFollowUpDate < now
- Quick actions depuis la liste des leads

---

### Story 7.6: Marquage comme perdu

**Epic:** Suivi Leads  
**Priority:** P0  
**Effort:** S  

#### Description
As an **estimateur**, I want to mark an estimate as lost with a reason so that it's properly closed.

#### Acceptance Criteria
- [ ] Bouton "Marquer comme perdu" sur les devis DRAFT/SUBMITTED/NEGOTIATION
- [ ] Modal avec:
  - Raison (dropdown): Prix trop élevé, Concurrent moins cher, Client a changé d'avis, Véhicule vendu, Injoignable, Autre
  - Notes explicatives (optionnel)
- [ ] Confirmation avant action
- [ ] Statut passe à LOST
- [ ] Raison stockée dans Estimate.lossReason (JSON ou string)
- [ ] Toast de confirmation

#### Technical Notes
- API: PATCH `/api/v1/estimates/:id/status` avec body { status: "LOST", lossReason: "..." }
- lossReason: stocker le code + notes si applicable
- AuditLog pour traçabilité

---

### Story 7.7: Statistiques des leads perdus

**Epic:** Suivi Leads  
**Priority:** P1  
**Effort:** M  

#### Description
As a **manager**, I want to analyze lost leads so that I understand why we're losing business.

#### Acceptance Criteria
- [ ] Section dans `/reports` ou widget dashboard
- [ ] Graphique camembert des raisons de perte
- [ ] Tableau: raison, count, pourcentage, montant total perdu
- [ ] Filtrage par période (mois, trimestre, année)
- [ ] Filtrage par estimateur (optionnel)
- [ ] Top 5 des raisons de perte

#### Technical Notes
- API: GET `/api/v1/reports/lost-leads?period=month`
- Grouper par lossReason
- Calculer le montant total = sum(total) des devis LOST

---

### Story 7.8: Alertes devis en attente

**Epic:** Suivi Leads  
**Priority:** P1  
**Effort:** M  

#### Description
As an **estimateur**, I want to be alerted about aging estimates so that I don't forget to follow up.

#### Acceptance Criteria
- [ ] Badge notification sur l'icône "Leads" dans la sidebar
- [ ] Count = nombre de leads > 7 jours sans relance
- [ ] Widget dashboard: "X devis nécessitent une relance"
- [ ] Clic → page leads filtrée
- [ ] Option pour snooze un lead (marquer comme "vu" pour 3 jours)

#### Technical Notes
- Badge dynamique avec count
- lastFollowUpDate vs now pour calculer les leads "stale"
- Snooze: champ snoozedUntil sur Estimate (optionnel)

---

### Story 7.9: Export liste des leads

**Epic:** Suivi Leads  
**Priority:** P1  
**Effort:** S  

#### Description
As a **manager**, I want to export the leads list so that I can analyze it in Excel.

#### Acceptance Criteria
- [ ] Bouton "Exporter CSV" sur la page leads
- [ ] Colonnes: Numéro, Client, Téléphone, Email, Véhicule, Montant, Âge, Dernière relance, Statut
- [ ] Téléchargement immédiat du fichier
- [ ] Nom du fichier: `leads-YYYY-MM-DD.csv`
- [ ] Encodage UTF-8 avec BOM (Excel compatible)

#### Technical Notes
- Génération côté serveur ou client selon taille
- Utiliser une lib comme json2csv
- Limiter à 1000 lignes max

---

### Story 7.10: Relances planifiées (vue calendrier)

**Epic:** Suivi Leads  
**Priority:** P2  
**Effort:** M  

#### Description
As an **estimateur**, I want to see planned follow-ups in a calendar view so that I can organize my day.

#### Acceptance Criteria
- [ ] Vue calendrier des relances prévues (nextFollowUpDate)
- [ ] Affichage semaine ou mois
- [ ] Événements cliquables → modal de suivi
- [ ] Couleurs selon statut du devis
- [ ] Indication du client et montant

#### Technical Notes
- Utiliser une lib calendrier (react-big-calendar, FullCalendar)
- API: GET `/api/v1/followups/scheduled?from=&to=`
- Vue optionnelle, peut être v1.1

---

## Résumé

| Story | Titre | Effort | Priority |
|-------|-------|--------|----------|
| 7.1 | API Liste des leads | S | P0 |
| 7.2 | Page liste des leads | M | P0 |
| 7.3 | Modèle FollowUp | S | P0 |
| 7.4 | API CRUD Relances | S | P0 |
| 7.5 | Interface de suivi | M | P0 |
| 7.6 | Marquage comme perdu | S | P0 |
| 7.7 | Statistiques des leads perdus | M | P1 |
| 7.8 | Alertes devis en attente | M | P1 |
| 7.9 | Export liste des leads | S | P1 |
| 7.10 | Relances planifiées (calendrier) | M | P2 |

**Total Stories:** 10  
**Effort estimé:** ~7-9 jours  

---

*Document créé par John (PM) — BMAD Method*
