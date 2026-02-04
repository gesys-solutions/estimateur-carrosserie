# Epic 5: Assurances

**Projet:** EstimPro (estimateur-carrosserie)  
**Date:** 2026-02-04  
**Auteur:** John (Product Manager — BMAD)  
**Version:** 1.0  

---

## Objectif

Implémenter la gestion des assurances : compagnies d'assurance (CRUD), association des réclamations aux devis, saisie du prix convenu après négociation, et historique des négociations.

**Valeur livrée :** À la fin de cet Epic, les estimateurs peuvent lier leurs devis aux assureurs, documenter les négociations, et conserver un historique complet pour référence future.

---

## Requirements couverts

- **FR-011:** Association dossier-assurance (compagnie, numéro réclamation, contact)
- **FR-012:** Saisie prix convenu (montant et date)
- **FR-013:** Historique négociations (notes avec date et auteur)
- **US-401, US-402, US-403, US-404**

---

## Dépendances

- **Epic 1: Foundation** — Prisma, structure
- **Epic 2: Auth & Users** — Authentification
- **Epic 4: Devis** — Devis existants pour y associer les réclamations

---

## Stories

---

### Story 5.1: API CRUD Compagnies d'assurance

**Epic:** Assurances  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want a CRUD API for insurance companies so that I can manage the list of insurers.

#### Acceptance Criteria
- [ ] Route `GET /api/v1/insurers` — Liste des assureurs du tenant
- [ ] Route `POST /api/v1/insurers` — Création
- [ ] Route `PUT /api/v1/insurers/:id` — Modification
- [ ] Route `DELETE /api/v1/insurers/:id` — Désactivation (soft delete)
- [ ] Champs: name*, code, phone, email, address, notes, isActive
- [ ] Isolation par tenant
- [ ] Validation Zod

#### Technical Notes
- Code court (ex: INT pour Intact, DES pour Desjardins)
- isActive pour ne pas supprimer les assureurs avec historique
- Tri alphabétique par défaut

---

### Story 5.2: Gestion des compagnies d'assurance (UI)

**Epic:** Assurances  
**Priority:** P0  
**Effort:** M  

#### Description
As a **manager**, I want to manage the list of insurance companies so that estimators can select them when creating claims.

#### Acceptance Criteria
- [ ] Route `/settings/insurers` (accès manager et admin)
- [ ] Liste des assureurs avec colonnes: Nom, Code, Téléphone, Email, Statut
- [ ] Bouton "Ajouter un assureur" → modal de création
- [ ] Modification inline ou modal
- [ ] Toggle pour activer/désactiver
- [ ] Recherche/filtre optionnel
- [ ] Toast de confirmation

#### Technical Notes
- Composants shadcn: Table, Dialog, Form
- Badge pour statut actif/inactif
- Seed avec les principaux assureurs québécois (Intact, Desjardins, La Capitale, SSQ, etc.)

---

### Story 5.3: API pour réclamations (Claims)

**Epic:** Assurances  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want an API for claims so that I can associate insurance information with estimates.

#### Acceptance Criteria
- [ ] Route `POST /api/v1/estimates/:id/claim` — Créer/associer une réclamation
- [ ] Route `PUT /api/v1/claims/:id` — Modifier une réclamation
- [ ] Route `DELETE /api/v1/claims/:id` — Supprimer (si aucun accord)
- [ ] Champs: insurerId*, claimNumber*, adjusterName, adjusterPhone, adjusterEmail, deductible
- [ ] Une seule réclamation par devis (relation 1:1)
- [ ] Validation: assureur doit exister et être actif

#### Technical Notes
- Relation optionnelle (devis peut ne pas avoir de réclamation)
- Deductible (franchise) en Decimal
- Numéro de réclamation: format libre (varie par assureur)

---

### Story 5.4: Associer une réclamation à un devis

**Epic:** Assurances  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to associate an insurance company and claim number with an estimate so that tracking is complete.

#### Acceptance Criteria
- [ ] Section "Assurance" sur la fiche devis
- [ ] Dropdown pour sélectionner l'assureur (parmi les actifs)
- [ ] Champ numéro de réclamation*
- [ ] Champs optionnels: nom expert, téléphone, email, franchise
- [ ] Bouton "Associer" sauvegarde la réclamation
- [ ] Affichage des infos assurance une fois associées
- [ ] Possibilité de modifier ou supprimer

#### Technical Notes
- Si réclamation existe déjà, afficher en mode lecture avec bouton "Modifier"
- Afficher le nom de l'assureur, pas juste l'ID
- Quick link vers la fiche assureur

---

### Story 5.5: Saisie du prix convenu

**Epic:** Assurances  
**Priority:** P0  
**Effort:** S  

#### Description
As an **estimateur**, I want to record the agreed price after negotiation so that I have an official record.

#### Acceptance Criteria
- [ ] Champ "Prix convenu" visible quand statut = APPROVED ou après
- [ ] Input numérique avec validation (positif, décimal 2 places)
- [ ] Date de l'accord enregistrée automatiquement
- [ ] Comparaison visuelle: prix convenu vs devis original
- [ ] Différence affichée (ex: -150$ ou +200$)
- [ ] Impossible de modifier après verrouillage

#### Technical Notes
- Champs: Estimate.agreedPrice, Estimate.agreedAt
- Afficher pourcentage: (agreedPrice / total) * 100
- Alerte visuelle si prix convenu < 90% du devis

---

### Story 5.6: API Historique des négociations

**Epic:** Assurances  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want an API for negotiation history so that all discussions are tracked.

#### Acceptance Criteria
- [ ] Route `GET /api/v1/estimates/:id/negotiations` — Liste des notes de négo
- [ ] Route `POST /api/v1/estimates/:id/negotiations` — Ajouter une note
- [ ] Champs: notes*, amount (optionnel)
- [ ] createdById et createdAt automatiques
- [ ] Tri par date décroissante
- [ ] Pas de modification/suppression (historique immuable)

#### Technical Notes
- amount: montant proposé/contre-proposé (pour tracking)
- Relation: Negotiation belongsTo Estimate, User
- Include createdBy.firstName, lastName dans la réponse

---

### Story 5.7: Interface historique des négociations

**Epic:** Assurances  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to see and add negotiation history on an estimate so that I know what was discussed.

#### Acceptance Criteria
- [ ] Section "Négociations" sur la fiche devis (après section Assurance)
- [ ] Timeline/liste des notes avec: date, auteur, montant (si applicable), notes
- [ ] Formulaire en bas pour ajouter une nouvelle note
- [ ] Champs: Notes* (textarea), Montant proposé (optionnel)
- [ ] Bouton "Ajouter" sauvegarde et rafraîchit la liste
- [ ] Notes affichées dans l'ordre chronologique inversé (plus récent en haut)

#### Technical Notes
- Composant Timeline ou liste avec avatars
- Textarea avec placeholder "Ex: Appel avec Jean Dupont. Contre-offre de 2300$..."
- Montant optionnel pour faciliter le suivi des propositions

---

### Story 5.8: Statistiques par assureur

**Epic:** Assurances  
**Priority:** P1  
**Effort:** M  

#### Description
As a **manager**, I want to analyze profitability by insurance company so that I optimize relationships.

#### Acceptance Criteria
- [ ] Route `/reports/insurers` (accès manager+)
- [ ] Tableau par assureur: Nb dossiers, Total devisé, Total convenu, Écart moyen, Délai moyen
- [ ] Période sélectionnable (mois, trimestre, année)
- [ ] Tri par colonne
- [ ] Export CSV optionnel (v1.1)
- [ ] Graphique camembert ou barre pour visualisation

#### Technical Notes
- Écart moyen = moyenne de (agreedPrice - total) / total
- Délai = jours entre création et approved
- Utiliser Recharts pour les graphiques
- API: GET `/api/v1/reports/by-insurer?period=month`

---

### Story 5.9: Seed des assureurs principaux

**Epic:** Assurances  
**Priority:** P1  
**Effort:** XS  

#### Description
As a **developer**, I want seed data for common insurers so that the application is ready to use immediately.

#### Acceptance Criteria
- [ ] Script seed crée les assureurs courants du Québec
- [ ] Liste minimale: Intact, Desjardins, La Capitale, SSQ, Promutuel, Wawanesa, TD Assurance, Aviva
- [ ] Codes courts assignés (INT, DES, CAP, SSQ, PRO, WAW, TDA, AVI)
- [ ] Script idempotent
- [ ] Appartiennent au tenant "Atelier Demo"

#### Technical Notes
- Ajouter à prisma/seed.ts existant
- Téléphones/emails fictifs ou vides
- Statut isActive = true

---

## Résumé

| Story | Titre | Effort | Priority |
|-------|-------|--------|----------|
| 5.1 | API CRUD Compagnies d'assurance | S | P0 |
| 5.2 | Gestion des compagnies (UI) | M | P0 |
| 5.3 | API pour réclamations | S | P0 |
| 5.4 | Associer une réclamation à un devis | M | P0 |
| 5.5 | Saisie du prix convenu | S | P0 |
| 5.6 | API Historique des négociations | S | P0 |
| 5.7 | Interface historique des négociations | M | P0 |
| 5.8 | Statistiques par assureur | M | P1 |
| 5.9 | Seed des assureurs principaux | XS | P1 |

**Total Stories:** 9  
**Effort estimé:** ~6-8 jours  

---

*Document créé par John (PM) — BMAD Method*
