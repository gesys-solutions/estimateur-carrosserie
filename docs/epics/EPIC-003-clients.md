# EPIC-003: Gestion Clients

## Description

Implémentation complète de la gestion des clients et de leurs véhicules. Cet Epic couvre le CRUD clients, le formulaire d'accueil rapide, l'association de véhicules, la recherche avancée, et l'historique des dossiers par client.

## Acceptance Criteria

- [ ] Créer, modifier, supprimer une fiche client
- [ ] Associer plusieurs véhicules à un client
- [ ] Recherche par nom, téléphone, email, ou immatriculation véhicule
- [ ] Historique des devis/dossiers d'un client
- [ ] Formulaire d'accueil optimisé pour rapidité
- [ ] Liste des clients avec pagination et tri
- [ ] Isolation multi-tenant des données

## Dependencies

- **EPIC-001:** Foundation
- **EPIC-002:** Auth & Users (pour isolation tenant et permissions)

## Technical Notes

- Prisma: Client, Vehicle, relations
- Recherche: PostgreSQL full-text search ou ILIKE
- Pagination: cursor-based ou offset
- Validation: zod schemas

## Related PRD Requirements

- FR-001: Créer, modifier, supprimer une fiche client
- FR-002: Associer véhicules à un client
- FR-003: Recherche clients
- US-101, US-102, US-103, US-104

---

## Stories

### Story 1: Schema Prisma Client & Vehicle

- **ID:** EPIC-003-S01
- **Estimate:** M
- **Description:** Ajouter les modèles Client et Vehicle au schema Prisma avec toutes les relations.
- **Acceptance Criteria:**
  - [ ] Modèle Client: id, tenantId, firstName, lastName, phone, email, address, city, postalCode, notes, createdAt, updatedAt, createdById
  - [ ] Modèle Vehicle: id, clientId, make, model, year, plate, vin, color, notes
  - [ ] Relation Client → Vehicles (hasMany)
  - [ ] Relation Client → Tenant (belongsTo)
  - [ ] Relation Client → User (createdBy)
  - [ ] Indexes: phone, email, plate (pour recherche)
  - [ ] Migration appliquée

### Story 2: API CRUD Clients

- **ID:** EPIC-003-S02
- **Estimate:** L
- **Description:** Créer les endpoints API REST pour la gestion des clients.
- **Acceptance Criteria:**
  - [ ] `GET /api/clients` — Liste paginée avec filtres (search, limit, cursor)
  - [ ] `GET /api/clients/[id]` — Détail client avec véhicules
  - [ ] `POST /api/clients` — Créer client
  - [ ] `PATCH /api/clients/[id]` — Modifier client
  - [ ] `DELETE /api/clients/[id]` — Supprimer client (soft delete ou cascade)
  - [ ] Validation zod
  - [ ] Tenant isolation automatique
  - [ ] Inclure createdBy dans la réponse

### Story 3: API CRUD Véhicules

- **ID:** EPIC-003-S03
- **Estimate:** M
- **Description:** Créer les endpoints API pour la gestion des véhicules d'un client.
- **Acceptance Criteria:**
  - [ ] `GET /api/clients/[clientId]/vehicles` — Liste véhicules du client
  - [ ] `POST /api/clients/[clientId]/vehicles` — Ajouter véhicule
  - [ ] `PATCH /api/vehicles/[id]` — Modifier véhicule
  - [ ] `DELETE /api/vehicles/[id]` — Supprimer véhicule
  - [ ] Validation zod
  - [ ] Vérification que le client appartient au tenant

### Story 4: Page Liste Clients

- **ID:** EPIC-003-S04
- **Estimate:** L
- **Description:** Interface pour lister tous les clients avec recherche, tri et pagination.
- **Acceptance Criteria:**
  - [ ] Route `/clients`
  - [ ] Tableau: nom, téléphone, email, véhicules (count), dernière activité
  - [ ] Barre de recherche (nom, téléphone, email, immatriculation)
  - [ ] Recherche en temps réel (debounce 300ms)
  - [ ] Pagination (10/25/50 par page)
  - [ ] Tri par colonnes (nom, date création)
  - [ ] Bouton "Nouveau client"
  - [ ] Lien vers fiche client

### Story 5: Page Fiche Client

- **ID:** EPIC-003-S05
- **Estimate:** L
- **Description:** Page détaillée d'un client avec infos, véhicules et historique.
- **Acceptance Criteria:**
  - [ ] Route `/clients/[id]`
  - [ ] Section infos client (éditable inline ou via modal)
  - [ ] Section véhicules (liste, ajouter, modifier, supprimer)
  - [ ] Section historique des dossiers/devis
  - [ ] Bouton "Créer un devis" (link vers Epic 4)
  - [ ] Breadcrumb navigation
  - [ ] Loading et error states

### Story 6: Formulaire Client

- **ID:** EPIC-003-S06
- **Estimate:** M
- **Description:** Composant formulaire réutilisable pour créer/modifier un client.
- **Acceptance Criteria:**
  - [ ] Composant `ClientForm`
  - [ ] Champs: prénom, nom, téléphone, email, adresse, ville, code postal, notes
  - [ ] Validation (téléphone format, email valide)
  - [ ] Mode création et édition
  - [ ] react-hook-form + zod
  - [ ] Submit avec loading state
  - [ ] Feedback toast success/error

### Story 7: Formulaire Véhicule

- **ID:** EPIC-003-S07
- **Estimate:** M
- **Description:** Composant formulaire pour ajouter/modifier un véhicule.
- **Acceptance Criteria:**
  - [ ] Composant `VehicleForm`
  - [ ] Champs: marque, modèle, année, immatriculation, VIN, couleur, notes
  - [ ] Validation (année valide, VIN format)
  - [ ] Mode création et édition
  - [ ] Utilisation dans modal/dialog
  - [ ] Submit avec loading state

### Story 8: Recherche Avancée API

- **ID:** EPIC-003-S08
- **Estimate:** M
- **Description:** Implémenter la recherche avancée côté API avec support multi-champs.
- **Acceptance Criteria:**
  - [ ] Recherche sur: nom, prénom, téléphone, email
  - [ ] Recherche sur immatriculation véhicule (join)
  - [ ] Case-insensitive (ILIKE PostgreSQL)
  - [ ] Performance: index sur champs searchables
  - [ ] Paramètre `?search=` sur GET /api/clients

### Story 9: Historique Dossiers Client

- **ID:** EPIC-003-S09
- **Estimate:** M
- **Description:** Afficher l'historique des dossiers/devis d'un client sur sa fiche.
- **Acceptance Criteria:**
  - [ ] Liste des dossiers sur la page client
  - [ ] Colonnes: date, véhicule, statut, montant
  - [ ] Tri par date (plus récent d'abord)
  - [ ] Lien vers le détail du dossier
  - [ ] Placeholder si aucun dossier
  - [ ] Note: Devis créés dans Epic 4, mais UI préparée ici

### Story 10: Accueil Client Rapide

- **ID:** EPIC-003-S10
- **Estimate:** M
- **Description:** Workflow optimisé pour l'accueil d'un nouveau client (client + véhicule en un seul flow).
- **Acceptance Criteria:**
  - [ ] Route `/clients/new` ou modal depuis `/clients`
  - [ ] Formulaire combiné: infos client + premier véhicule
  - [ ] Option "Ajouter véhicule" (optionnel)
  - [ ] Création atomique (transaction)
  - [ ] Redirection vers fiche client après création
  - [ ] UX optimisée pour rapidité (<30 sec)

---

## Estimation Summary

| Size | Count | Stories |
|------|-------|---------|
| S | 0 | — |
| M | 6 | S01, S03, S06, S07, S08, S09, S10 |
| L | 3 | S02, S04, S05 |

**Total: 10 stories**

---

*EPIC créé par John (PM) — BMAD Method*  
*Projet: EstimPro (estimateur-carrosserie)*  
*Date: 2026-02-04*
