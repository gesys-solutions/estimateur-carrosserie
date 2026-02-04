# EPIC-004: Gestion des Devis

## Description

Cœur fonctionnel d'EstimPro : création et gestion complète des devis. Cet Epic couvre la structure du devis (items, main d'œuvre, pièces), les calculs automatiques (totaux, taxes TPS/TVQ), le workflow de statuts, le verrouillage après approbation, et l'export PDF.

## Acceptance Criteria

- [ ] Créer un devis structuré avec sections (main d'œuvre, pièces, peinture, divers)
- [ ] Ajouter, modifier, supprimer des items avec calcul automatique
- [ ] Calcul automatique des totaux et taxes (TPS 5%, TVQ 9.975%)
- [ ] Workflow de statuts complet (10 statuts)
- [ ] Verrouillage du prix après approbation
- [ ] Export PDF professionnel
- [ ] Historique des changements de statut
- [ ] Association client + véhicule obligatoire

## Dependencies

- **EPIC-001:** Foundation
- **EPIC-002:** Auth & Users
- **EPIC-003:** Clients (pour association client/véhicule)

## Technical Notes

- Prisma: Quote, QuoteItem, QuoteStatusHistory
- PDF: react-pdf ou server-side generation (puppeteer/playwright)
- Calculs: precision avec Decimal.js ou native BigInt
- Statuts: enum avec machine d'état

## Related PRD Requirements

- FR-004: Créer un devis structuré
- FR-005: Ajouter/modifier/supprimer des items
- FR-006: Calcul automatique totaux et taxes
- FR-007: Export PDF
- FR-008: Statuts de dossier
- FR-009: Changement de statut
- FR-010: Verrouillage prix convenu
- US-201, US-202, US-203, US-204, US-205, US-206
- US-301, US-302, US-303, US-304

---

## Stories

### Story 1: Schema Prisma Devis

- **ID:** EPIC-004-S01
- **Estimate:** L
- **Description:** Ajouter les modèles Quote, QuoteItem, QuoteStatusHistory au schema Prisma.
- **Acceptance Criteria:**
  - [ ] Modèle Quote: id, tenantId, clientId, vehicleId, reference, status, subtotal, taxTPS, taxTVQ, total, lockedPrice, lockedAt, notes, createdById, createdAt, updatedAt
  - [ ] Modèle QuoteItem: id, quoteId, category (enum: LABOR, PARTS, PAINT, OTHER), description, quantity, unitPrice, total
  - [ ] Modèle QuoteStatusHistory: id, quoteId, fromStatus, toStatus, changedById, changedAt, notes
  - [ ] Enum QuoteStatus: DRAFT, SUBMITTED, NEGOTIATION, APPROVED, SIGNED, IN_REPAIR, READY, DELIVERED, CLOSED, LOST
  - [ ] Enum ItemCategory: LABOR, PARTS, PAINT, OTHER
  - [ ] Relations Quote → Client, Vehicle, Items, StatusHistory
  - [ ] Migration appliquée

### Story 2: API CRUD Devis

- **ID:** EPIC-004-S02
- **Estimate:** L
- **Description:** Créer les endpoints API pour la gestion des devis.
- **Acceptance Criteria:**
  - [ ] `GET /api/quotes` — Liste paginée avec filtres (status, clientId, search)
  - [ ] `GET /api/quotes/[id]` — Détail avec items et historique
  - [ ] `POST /api/quotes` — Créer devis (clientId, vehicleId requis)
  - [ ] `PATCH /api/quotes/[id]` — Modifier devis (si non verrouillé)
  - [ ] `DELETE /api/quotes/[id]` — Supprimer brouillon uniquement
  - [ ] Génération automatique de référence (ex: QT-2026-0001)
  - [ ] Tenant isolation

### Story 3: API Items de Devis

- **ID:** EPIC-004-S03
- **Estimate:** M
- **Description:** Créer les endpoints pour gérer les items d'un devis.
- **Acceptance Criteria:**
  - [ ] `POST /api/quotes/[id]/items` — Ajouter item
  - [ ] `PATCH /api/quotes/[id]/items/[itemId]` — Modifier item
  - [ ] `DELETE /api/quotes/[id]/items/[itemId]` — Supprimer item
  - [ ] Recalcul automatique du total devis après chaque opération
  - [ ] Vérification que le devis n'est pas verrouillé

### Story 4: Calcul Totaux et Taxes

- **ID:** EPIC-004-S04
- **Estimate:** M
- **Description:** Implémenter la logique de calcul des sous-totaux, TPS, TVQ et total.
- **Acceptance Criteria:**
  - [ ] Sous-total = somme des items
  - [ ] TPS = sous-total × 5%
  - [ ] TVQ = sous-total × 9.975%
  - [ ] Total = sous-total + TPS + TVQ
  - [ ] Précision: 2 décimales, arrondi standard
  - [ ] Fonction utilitaire réutilisable
  - [ ] Recalcul automatique côté API

### Story 5: API Changement de Statut

- **ID:** EPIC-004-S05
- **Estimate:** M
- **Description:** Endpoint pour changer le statut d'un devis avec validation et historique.
- **Acceptance Criteria:**
  - [ ] `POST /api/quotes/[id]/status` — Changer statut
  - [ ] Body: { status, notes? }
  - [ ] Validation des transitions autorisées
  - [ ] Création entrée dans QuoteStatusHistory
  - [ ] Verrouillage automatique si statut = APPROVED
  - [ ] Retour du devis mis à jour

### Story 6: Page Liste Devis

- **ID:** EPIC-004-S06
- **Estimate:** L
- **Description:** Interface pour lister tous les devis avec filtres et recherche.
- **Acceptance Criteria:**
  - [ ] Route `/devis` ou `/quotes`
  - [ ] Tableau: référence, client, véhicule, statut (badge couleur), montant, date
  - [ ] Filtres: par statut, par date, par estimateur
  - [ ] Recherche: référence, nom client
  - [ ] Pagination
  - [ ] Bouton "Nouveau devis"
  - [ ] Actions rapides: voir, modifier, changer statut

### Story 7: Page Création/Édition Devis

- **ID:** EPIC-004-S07
- **Estimate:** L
- **Description:** Interface complète pour créer ou modifier un devis avec ses items.
- **Acceptance Criteria:**
  - [ ] Route `/devis/new` et `/devis/[id]/edit`
  - [ ] Sélection client (autocomplete) avec option créer nouveau
  - [ ] Sélection véhicule (du client)
  - [ ] Section items par catégorie (Main d'œuvre, Pièces, Peinture, Divers)
  - [ ] Formulaire inline pour ajouter/modifier items
  - [ ] Totaux en temps réel (recalcul côté client)
  - [ ] Zone notes
  - [ ] Boutons: Enregistrer brouillon, Soumettre
  - [ ] Mode lecture seule si verrouillé

### Story 8: Composant ItemsEditor

- **ID:** EPIC-004-S08
- **Estimate:** L
- **Description:** Composant réutilisable pour éditer la liste des items d'un devis.
- **Acceptance Criteria:**
  - [ ] Tableau éditable avec colonnes: catégorie, description, qté, prix unit., total
  - [ ] Bouton "Ajouter item" par catégorie
  - [ ] Édition inline (click to edit)
  - [ ] Suppression avec confirmation
  - [ ] Drag & drop pour réordonner (optionnel)
  - [ ] Sous-totaux par catégorie
  - [ ] Total général

### Story 9: Export PDF

- **ID:** EPIC-004-S09
- **Estimate:** L
- **Description:** Générer un PDF professionnel du devis pour envoi à l'assureur.
- **Acceptance Criteria:**
  - [ ] `GET /api/quotes/[id]/pdf` — Retourne le PDF
  - [ ] En-tête: logo atelier, coordonnées tenant
  - [ ] Infos client et véhicule
  - [ ] Tableau des items par catégorie
  - [ ] Sous-totaux, taxes, total
  - [ ] Numéro de référence et date
  - [ ] Zone signature (vide pour impression)
  - [ ] Bouton "Télécharger PDF" dans l'UI

### Story 10: Workflow Statuts UI

- **ID:** EPIC-004-S10
- **Estimate:** M
- **Description:** Interface pour visualiser et changer le statut d'un devis.
- **Acceptance Criteria:**
  - [ ] Badge statut coloré sur la page devis
  - [ ] Dropdown/menu pour changer le statut
  - [ ] Afficher uniquement les transitions valides
  - [ ] Modal de confirmation avec champ notes optionnel
  - [ ] Historique des changements de statut visible
  - [ ] Indication si devis verrouillé

### Story 11: Page Détail Devis

- **ID:** EPIC-004-S11
- **Estimate:** M
- **Description:** Page de visualisation d'un devis avec toutes les informations.
- **Acceptance Criteria:**
  - [ ] Route `/devis/[id]`
  - [ ] Affichage infos client et véhicule
  - [ ] Liste des items par catégorie
  - [ ] Totaux et taxes
  - [ ] Statut avec historique
  - [ ] Actions: Modifier (si non verrouillé), PDF, Changer statut
  - [ ] Lien vers les infos assurance (préparé pour Epic 5)

---

## Estimation Summary

| Size | Count | Stories |
|------|-------|---------|
| S | 0 | — |
| M | 5 | S03, S04, S05, S10, S11 |
| L | 6 | S01, S02, S06, S07, S08, S09 |

**Total: 11 stories**

---

*EPIC créé par John (PM) — BMAD Method*  
*Projet: EstimPro (estimateur-carrosserie)*  
*Date: 2026-02-04*
