# EPIC-007: Suivi & Relances

## Description

Système de suivi des devis non convertis (leads) et de relances clients. Cet Epic permet d'éviter que les devis "tombent entre les craques" en offrant une vue dédiée aux dossiers nécessitant une action, avec possibilité d'ajouter des notes et de planifier des relances.

## Acceptance Criteria

- [ ] Liste des devis non convertis (>X jours sans action)
- [ ] Système de notes de relance avec date et contenu
- [ ] Marquage "raison de perte" pour les dossiers LOST
- [ ] Filtres: par ancienneté, par estimateur, par statut
- [ ] Vue "À relancer" pour action quotidienne
- [ ] Historique des relances par dossier

## Dependencies

- **EPIC-001:** Foundation
- **EPIC-002:** Auth & Users
- **EPIC-004:** Gestion des Devis

## Technical Notes

- Prisma: FollowUp (ou extension de Quote)
- Calcul ancienneté: jours depuis dernière action/changement statut
- Raisons de perte: enum ou table configurable

## Related PRD Requirements

- FR-104: Liste des devis non convertis
- FR-105: Système de relance avec date et notes
- FR-106: Raison de perte

---

## Stories

### Story 1: Schema Prisma Relances

- **ID:** EPIC-007-S01
- **Estimate:** M
- **Description:** Ajouter les modèles pour le suivi et les relances.
- **Acceptance Criteria:**
  - [ ] Modèle FollowUp: id, quoteId, type (enum: CALL, EMAIL, OTHER), content, scheduledAt, completedAt, createdById, createdAt
  - [ ] Extension Quote: lostReason (enum ou string), lostAt, lostNotes
  - [ ] Enum FollowUpType: CALL, EMAIL, VISIT, OTHER
  - [ ] Enum LostReason: PRICE, DELAY, COMPETITOR, NO_RESPONSE, OTHER
  - [ ] Relation Quote → FollowUps (hasMany)
  - [ ] Migration appliquée

### Story 2: API Relances

- **ID:** EPIC-007-S02
- **Estimate:** M
- **Description:** Créer les endpoints pour gérer les relances d'un dossier.
- **Acceptance Criteria:**
  - [ ] `GET /api/quotes/[id]/followups` — Liste des relances
  - [ ] `POST /api/quotes/[id]/followups` — Créer relance
  - [ ] `PATCH /api/followups/[id]` — Modifier (ex: marquer comme fait)
  - [ ] `DELETE /api/followups/[id]` — Supprimer relance
  - [ ] Champs création: type, content, scheduledAt
  - [ ] Champs update: completedAt

### Story 3: API Dossiers à Relancer

- **ID:** EPIC-007-S03
- **Estimate:** M
- **Description:** Endpoint pour lister les dossiers nécessitant une relance.
- **Acceptance Criteria:**
  - [ ] `GET /api/quotes/to-follow-up` — Liste des devis à relancer
  - [ ] Critères: statut DRAFT/SUBMITTED/NEGOTIATION + >X jours sans changement
  - [ ] Paramètre: daysThreshold (default: 7)
  - [ ] Paramètre: estimatorId (optionnel, pour manager)
  - [ ] Tri par ancienneté (plus ancien en premier)
  - [ ] Inclure dernière note/relance

### Story 4: API Marquer Perdu

- **ID:** EPIC-007-S04
- **Estimate:** S
- **Description:** Endpoint pour marquer un dossier comme perdu avec raison.
- **Acceptance Criteria:**
  - [ ] `POST /api/quotes/[id]/mark-lost` — Marquer comme LOST
  - [ ] Body: { reason, notes? }
  - [ ] Met à jour: status=LOST, lostReason, lostAt, lostNotes
  - [ ] Crée entrée dans QuoteStatusHistory
  - [ ] Validation: dossier pas déjà closed/delivered

### Story 5: Page Suivi Relances

- **ID:** EPIC-007-S05
- **Estimate:** L
- **Description:** Interface principale pour voir et gérer les dossiers à relancer.
- **Acceptance Criteria:**
  - [ ] Route `/relances` ou `/follow-ups`
  - [ ] Liste des dossiers nécessitant attention
  - [ ] Colonnes: référence, client, téléphone, statut, jours depuis action, dernière note
  - [ ] Code couleur par ancienneté (vert <7j, orange 7-14j, rouge >14j)
  - [ ] Filtres: par statut, par estimateur (manager)
  - [ ] Actions: Appeler, Ajouter note, Marquer perdu, Voir dossier

### Story 6: Widget Ajout Relance

- **ID:** EPIC-007-S06
- **Estimate:** M
- **Description:** Composant pour ajouter rapidement une note de relance.
- **Acceptance Criteria:**
  - [ ] Modal ou inline form
  - [ ] Champs: type (appel/email/autre), contenu, date planifiée (optionnel)
  - [ ] Bouton action rapide depuis la liste
  - [ ] Auto-complétion du contenu courant
  - [ ] Feedback success/error

### Story 7: Section Relances sur Page Devis

- **ID:** EPIC-007-S07
- **Estimate:** M
- **Description:** Afficher l'historique des relances sur la page détail d'un devis.
- **Acceptance Criteria:**
  - [ ] Section "Historique des relances" sur page devis
  - [ ] Liste chronologique des relances
  - [ ] Badge si relance planifiée future
  - [ ] Bouton "Ajouter relance"
  - [ ] Indication si overdue

### Story 8: Modal Marquer Perdu

- **ID:** EPIC-007-S08
- **Estimate:** S
- **Description:** Interface pour marquer un dossier comme perdu.
- **Acceptance Criteria:**
  - [ ] Modal avec sélection raison (dropdown)
  - [ ] Options: Prix, Délai, Concurrent, Pas de réponse, Autre
  - [ ] Zone notes libres
  - [ ] Confirmation avant action
  - [ ] Feedback et fermeture

### Story 9: Badge Alerte Relance

- **ID:** EPIC-007-S09
- **Estimate:** S
- **Description:** Indicateur visuel sur le dashboard pour les dossiers à relancer.
- **Acceptance Criteria:**
  - [ ] Badge/compteur sur le menu "Relances"
  - [ ] Nombre de dossiers à relancer
  - [ ] Couleur selon urgence
  - [ ] Visible dans le header ou sidebar
  - [ ] Rafraîchi avec les données dashboard

### Story 10: Rapport Leads Perdus

- **ID:** EPIC-007-S10
- **Estimate:** M
- **Description:** Vue analytique des dossiers perdus par raison.
- **Acceptance Criteria:**
  - [ ] Route `/reports/lost` ou section dans dashboard
  - [ ] Graphique: répartition par raison de perte
  - [ ] Période sélectionnable (mois, trimestre)
  - [ ] Montant total perdu
  - [ ] Liste des dossiers perdus avec détails
  - [ ] Export CSV (optionnel)

---

## Estimation Summary

| Size | Count | Stories |
|------|-------|---------|
| S | 3 | S04, S08, S09 |
| M | 6 | S01, S02, S03, S06, S07, S10 |
| L | 1 | S05 |

**Total: 10 stories**

---

*EPIC créé par John (PM) — BMAD Method*  
*Projet: EstimPro (estimateur-carrosserie)*  
*Date: 2026-02-04*
