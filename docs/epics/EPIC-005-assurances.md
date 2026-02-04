# EPIC-005: Gestion des Assurances

## Description

Gestion des relations avec les compagnies d'assurance : association des dossiers aux assureurs, suivi des négociations, enregistrement du prix convenu, et historique des échanges. Cet Epic permet de centraliser toutes les informations liées aux assurances pour optimiser les négociations.

## Acceptance Criteria

- [ ] Gérer un répertoire de compagnies d'assurance
- [ ] Associer un devis à une compagnie d'assurance
- [ ] Saisir le numéro de réclamation
- [ ] Enregistrer le prix convenu après négociation
- [ ] Historique des négociations (notes avec date et auteur)
- [ ] Vue des dossiers par assureur

## Dependencies

- **EPIC-001:** Foundation
- **EPIC-002:** Auth & Users
- **EPIC-004:** Gestion des Devis (pour lier assurance au devis)

## Technical Notes

- Prisma: InsuranceCompany, QuoteInsurance, NegotiationNote
- Prix convenu stocké séparément du total devis original
- Historique des notes avec timestamps

## Related PRD Requirements

- FR-011: Association dossier-assurance
- FR-012: Saisie prix convenu
- FR-013: Historique négociations
- US-401, US-402, US-403, US-404

---

## Stories

### Story 1: Schema Prisma Assurances

- **ID:** EPIC-005-S01
- **Estimate:** M
- **Description:** Ajouter les modèles pour la gestion des assurances au schema Prisma.
- **Acceptance Criteria:**
  - [ ] Modèle InsuranceCompany: id, tenantId, name, phone, email, address, contactName, notes, isActive, createdAt
  - [ ] Modèle QuoteInsurance: id, quoteId, insuranceCompanyId, claimNumber, adjusterName, adjusterPhone, adjusterEmail, agreedPrice, agreedAt, notes
  - [ ] Modèle NegotiationNote: id, quoteInsuranceId, content, createdById, createdAt
  - [ ] Relations Quote → QuoteInsurance (hasOne), QuoteInsurance → InsuranceCompany, NegotiationNotes
  - [ ] Migration appliquée

### Story 2: API CRUD Compagnies d'Assurance

- **ID:** EPIC-005-S02
- **Estimate:** M
- **Description:** Créer les endpoints pour gérer le répertoire des compagnies d'assurance.
- **Acceptance Criteria:**
  - [ ] `GET /api/insurance-companies` — Liste (avec search)
  - [ ] `GET /api/insurance-companies/[id]` — Détail
  - [ ] `POST /api/insurance-companies` — Créer
  - [ ] `PATCH /api/insurance-companies/[id]` — Modifier
  - [ ] `DELETE /api/insurance-companies/[id]` — Désactiver
  - [ ] Tenant isolation
  - [ ] Validation zod

### Story 3: API Association Devis-Assurance

- **ID:** EPIC-005-S03
- **Estimate:** M
- **Description:** Créer les endpoints pour associer un devis à une assurance.
- **Acceptance Criteria:**
  - [ ] `GET /api/quotes/[id]/insurance` — Détail assurance du devis
  - [ ] `POST /api/quotes/[id]/insurance` — Associer assurance
  - [ ] `PATCH /api/quotes/[id]/insurance` — Modifier infos assurance
  - [ ] Champs: insuranceCompanyId, claimNumber, adjusterName, adjusterPhone, adjusterEmail
  - [ ] Validation que le devis existe et appartient au tenant

### Story 4: API Prix Convenu

- **ID:** EPIC-005-S04
- **Estimate:** S
- **Description:** Endpoint pour enregistrer le prix convenu après négociation.
- **Acceptance Criteria:**
  - [ ] `POST /api/quotes/[id]/insurance/agreed-price` — Saisir prix convenu
  - [ ] Body: { agreedPrice, notes? }
  - [ ] Enregistre agreedPrice et agreedAt
  - [ ] Ajoute une note automatique dans l'historique
  - [ ] Peut déclencher le passage en statut APPROVED (optionnel)

### Story 5: API Notes de Négociation

- **ID:** EPIC-005-S05
- **Estimate:** M
- **Description:** Créer les endpoints pour l'historique des notes de négociation.
- **Acceptance Criteria:**
  - [ ] `GET /api/quotes/[id]/insurance/notes` — Liste des notes
  - [ ] `POST /api/quotes/[id]/insurance/notes` — Ajouter note
  - [ ] Champs: content
  - [ ] Auto: createdById, createdAt
  - [ ] Tri par date décroissante

### Story 6: Page Répertoire Assurances

- **ID:** EPIC-005-S06
- **Estimate:** M
- **Description:** Interface pour gérer le répertoire des compagnies d'assurance.
- **Acceptance Criteria:**
  - [ ] Route `/assurances` ou `/insurance-companies`
  - [ ] Tableau: nom, téléphone, contact, nombre de dossiers, statut
  - [ ] Recherche par nom
  - [ ] Bouton "Ajouter compagnie"
  - [ ] Actions: Modifier, Désactiver
  - [ ] Dialog formulaire création/édition

### Story 7: Formulaire Compagnie d'Assurance

- **ID:** EPIC-005-S07
- **Estimate:** S
- **Description:** Composant formulaire pour créer/modifier une compagnie d'assurance.
- **Acceptance Criteria:**
  - [ ] Composant `InsuranceCompanyForm`
  - [ ] Champs: nom, téléphone, email, adresse, contact principal, notes
  - [ ] Validation
  - [ ] Mode création et édition
  - [ ] Utilisable dans dialog

### Story 8: Section Assurance sur Page Devis

- **ID:** EPIC-005-S08
- **Estimate:** L
- **Description:** Ajouter une section "Assurance" sur la page détail/édition du devis.
- **Acceptance Criteria:**
  - [ ] Section collapsible "Informations Assurance"
  - [ ] Sélection compagnie (autocomplete avec option créer)
  - [ ] Champs: numéro réclamation, nom/tel/email ajusteur
  - [ ] Affichage prix convenu si défini
  - [ ] Bouton "Saisir prix convenu" → modal
  - [ ] Historique des notes de négociation
  - [ ] Formulaire pour ajouter une note

### Story 9: Widget Prix Convenu

- **ID:** EPIC-005-S09
- **Estimate:** M
- **Description:** Composant pour saisir et afficher le prix convenu.
- **Acceptance Criteria:**
  - [ ] Affichage prix original vs prix convenu
  - [ ] Différence (gain ou perte) avec couleur
  - [ ] Modal de saisie: montant, notes optionnelles
  - [ ] Confirmation avant enregistrement
  - [ ] Date d'accord affichée

### Story 10: Liste Dossiers par Assureur

- **ID:** EPIC-005-S10
- **Estimate:** M
- **Description:** Vue des dossiers filtrés par compagnie d'assurance.
- **Acceptance Criteria:**
  - [ ] Sur la page détail d'une compagnie, liste de ses dossiers
  - [ ] Ou filtre par assureur sur la page liste des devis
  - [ ] Colonnes: référence, client, montant, prix convenu, statut
  - [ ] Statistiques: nombre de dossiers, montant total

---

## Estimation Summary

| Size | Count | Stories |
|------|-------|---------|
| S | 2 | S04, S07 |
| M | 7 | S01, S02, S03, S05, S06, S09, S10 |
| L | 1 | S08 |

**Total: 10 stories**

---

*EPIC créé par John (PM) — BMAD Method*  
*Projet: EstimPro (estimateur-carrosserie)*  
*Date: 2026-02-04*
