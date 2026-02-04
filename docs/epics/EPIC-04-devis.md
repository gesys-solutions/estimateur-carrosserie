# Epic 4: Devis

**Projet:** EstimPro (estimateur-carrosserie)  
**Date:** 2026-02-04  
**Auteur:** John (Product Manager — BMAD)  
**Version:** 1.0  

---

## Objectif

Implémenter le cœur de l'application : la création et gestion des devis. Cela inclut la création structurée de devis avec items (main d'œuvre, pièces, peinture), les calculs automatiques (sous-totaux, taxes), le workflow de statuts, le verrouillage après accord, et l'export PDF.

**Valeur livrée :** À la fin de cet Epic, les estimateurs peuvent créer des devis professionnels rapidement, suivre leur progression, et les exporter en PDF pour les assureurs.

---

## Requirements couverts

- **FR-004:** Créer un devis structuré (sections: main d'œuvre, pièces, peinture, divers)
- **FR-005:** Ajouter/modifier/supprimer des items
- **FR-006:** Calcul automatique totaux et taxes (TPS/TVQ)
- **FR-007:** Export PDF
- **FR-008:** Statuts de dossier (10 statuts)
- **FR-009:** Changement de statut avec timestamp
- **FR-010:** Verrouillage prix convenu après approved
- **US-201, US-202, US-203, US-301, US-302, US-303, US-304**

---

## Dépendances

- **Epic 1: Foundation** — Prisma, structure projet
- **Epic 2: Auth & Users** — Authentification, rôles
- **Epic 3: Clients** — Clients et véhicules (FK obligatoires)

---

## Stories

---

### Story 4.1: API CRUD Devis

**Epic:** Devis  
**Priority:** P0  
**Effort:** M  

#### Description
As a **developer**, I want a complete CRUD API for estimates so that I can manage estimates from the frontend.

#### Acceptance Criteria
- [ ] Route `GET /api/v1/estimates` — Liste paginée avec filtres (status, createdById)
- [ ] Route `GET /api/v1/estimates/:id` — Détail complet avec items, client, véhicule
- [ ] Route `POST /api/v1/estimates` — Création d'un nouveau devis
- [ ] Route `PUT /api/v1/estimates/:id` — Modification (si non verrouillé)
- [ ] Route `DELETE /api/v1/estimates/:id` — Suppression (si draft uniquement)
- [ ] Génération automatique du numéro de devis (EST-2026-0001)
- [ ] Association obligatoire: clientId, vehicleId, createdById
- [ ] Isolation par tenant

#### Technical Notes
- Numéro séquentiel par tenant et année
- Include: client, vehicle, lineItems, claim, createdBy
- Filtres: `?status=DRAFT&createdById=xxx&page=1`

---

### Story 4.2: Formulaire de création de devis

**Epic:** Devis  
**Priority:** P0  
**Effort:** L  

#### Description
As an **estimateur**, I want to create a structured estimate with items so that the document is complete and professional.

#### Acceptance Criteria
- [ ] Route `/estimates/new` avec formulaire complet
- [ ] Étape 1: Sélectionner client (recherche) et véhicule
- [ ] Étape 2: Ajouter les items (main d'œuvre, pièces, peinture, divers)
- [ ] Type de dommage (dropdown: collision, vandalisme, grêle, etc.)
- [ ] Description des dommages (textarea)
- [ ] Totaux calculés en temps réel
- [ ] Bouton "Créer le devis" (sauvegarde en draft)
- [ ] Redirection vers le détail du devis créé

#### Technical Notes
- Wizard multi-étapes ou formulaire scrollable
- Autocomplete pour recherche client
- Sous-formulaire dynamique pour les items
- Calculs côté client + validation serveur

---

### Story 4.3: Gestion des items de devis (LineItems)

**Epic:** Devis  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to add, modify, and delete estimate items so that I can build a detailed estimate.

#### Acceptance Criteria
- [ ] Section "Items" avec tableau éditable
- [ ] Types d'items: Main d'œuvre, Pièce, Peinture, Divers
- [ ] Champs par item: Type, Description*, Quantité*, Prix unitaire*, Sous-total (calculé)
- [ ] Bouton "Ajouter item" crée une nouvelle ligne
- [ ] Modification inline des valeurs
- [ ] Suppression avec icône (confirmation)
- [ ] Réordonnancement par drag & drop (optionnel v1.1)
- [ ] Sous-total par section (ex: Total main d'œuvre)

#### Technical Notes
- API: POST/PUT/DELETE `/api/v1/estimates/:id/items`
- Calcul sous-total: quantity * unitPrice
- Décimales: 2 pour prix, 2 pour quantité
- Regrouper visuellement par type

---

### Story 4.4: Calcul automatique des totaux et taxes

**Epic:** Devis  
**Priority:** P0  
**Effort:** S  

#### Description
As an **estimateur**, I want totals and taxes calculated automatically so that I don't make calculation errors.

#### Acceptance Criteria
- [ ] Sous-total: somme de tous les items
- [ ] TPS (5%): calculée sur le sous-total
- [ ] TVQ (9.975%): calculée sur le sous-total
- [ ] Total: sous-total + TPS + TVQ
- [ ] Affichage en temps réel lors de l'édition
- [ ] Taux de taxes configurables par tenant
- [ ] Arrondi à 2 décimales

#### Technical Notes
- Stocker les taux dans Tenant.taxConfig (JSON)
- Calcul côté client pour l'affichage, recalcul côté serveur à la sauvegarde
- Utiliser Decimal.js ou big.js pour éviter les erreurs de floating point

---

### Story 4.5: Liste des devis

**Epic:** Devis  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to see a list of all estimates so that I can find and manage my work.

#### Acceptance Criteria
- [ ] Route `/estimates` affiche la liste paginée
- [ ] Colonnes: Numéro, Client, Véhicule, Statut (badge), Total, Date, Créé par
- [ ] Filtrage par statut (tabs ou dropdown)
- [ ] Filtrage par estimateur (managers/admins uniquement)
- [ ] Tri par date, par montant
- [ ] Recherche par numéro de devis ou nom client
- [ ] Ligne cliquable → détail
- [ ] Bouton "Nouveau devis" proéminent

#### Technical Notes
- Badge couleur par statut (vert approved, jaune negotiation, etc.)
- Hook `useEstimates(filters)` avec TanStack Query
- Skeleton loading
- Responsive: cards sur mobile

---

### Story 4.6: Fiche détail devis

**Epic:** Devis  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to view a complete estimate so that I can review all details.

#### Acceptance Criteria
- [ ] Route `/estimates/:id` affiche toutes les informations
- [ ] Section: Infos client et véhicule (liens vers fiches)
- [ ] Section: Items regroupés par type avec totaux par section
- [ ] Section: Récapitulatif (sous-total, taxes, total, prix convenu si applicable)
- [ ] Section: Assurance et réclamation (si associée)
- [ ] Section: Historique des négociations
- [ ] Section: Signatures
- [ ] Bouton "Modifier" (si non verrouillé)
- [ ] Bouton "Exporter PDF"
- [ ] Statut actuel avec dropdown pour changer

#### Technical Notes
- Layout en colonnes sur desktop
- Tabs ou accordéon pour les sections secondaires
- Audit trail minimal (date création, dernière modif)

---

### Story 4.7: Workflow de statuts

**Epic:** Devis  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to change the status of an estimate so that tracking is up to date.

#### Acceptance Criteria
- [ ] 10 statuts: DRAFT, SUBMITTED, NEGOTIATION, APPROVED, SIGNED, IN_REPAIR, READY, DELIVERED, CLOSED, LOST
- [ ] Dropdown ou boutons pour changer le statut
- [ ] Transitions valides définies (pas n'importe quel statut vers n'importe quel autre)
- [ ] Timestamp et userId enregistrés à chaque changement
- [ ] Historique des changements de statut visible
- [ ] API: PATCH `/api/v1/estimates/:id/status` avec nouveau statut

#### Technical Notes
- Transitions valides: DRAFT→SUBMITTED→NEGOTIATION⇄→APPROVED→SIGNED→IN_REPAIR→READY→DELIVERED→CLOSED
- LOST accessible depuis DRAFT, SUBMITTED, NEGOTIATION
- Empêcher retour en arrière après SIGNED (sauf admin)

---

### Story 4.8: Verrouillage du prix convenu

**Epic:** Devis  
**Priority:** P0  
**Effort:** S  

#### Description
As an **estimateur**, I want to lock the agreed price so that it cannot be modified after the agreement.

#### Acceptance Criteria
- [ ] Champ "Prix convenu" (agreedPrice) disponible au statut APPROVED
- [ ] Bouton "Verrouiller le devis" après saisie du prix convenu
- [ ] Confirmation modal avant verrouillage
- [ ] Une fois verrouillé: items et prix non modifiables
- [ ] Affichage clair "Devis verrouillé" avec date
- [ ] Seul un admin peut déverrouiller (future feature)

#### Technical Notes
- Champ isLocked dans Estimate
- API: POST `/api/v1/estimates/:id/lock`
- Middleware vérifie isLocked sur PUT endpoints
- AuditLog pour le verrouillage

---

### Story 4.9: Export PDF du devis

**Epic:** Devis  
**Priority:** P0  
**Effort:** L  

#### Description
As an **estimateur**, I want to export the estimate as a PDF so that I can send it to the insurer.

#### Acceptance Criteria
- [ ] Bouton "Télécharger PDF" sur la fiche devis
- [ ] PDF format professionnel avec:
  - Logo de l'atelier (ou placeholder)
  - Coordonnées atelier
  - Infos client et véhicule
  - Tableau des items avec totaux
  - Récapitulatif taxes et total
  - Numéro de devis et date
- [ ] Génération < 3 secondes
- [ ] Nom du fichier: `Devis-EST-2026-0001.pdf`
- [ ] Option: envoyer par email (v1.1)

#### Technical Notes
- Utiliser @react-pdf/renderer côté serveur
- API: GET `/api/v1/estimates/:id/pdf` retourne le stream
- Alternative: puppeteer/playwright pour HTML→PDF
- Template PDF en composant React

---

### Story 4.10: Modification d'un devis

**Epic:** Devis  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to edit an existing estimate so that I can correct or update it.

#### Acceptance Criteria
- [ ] Route `/estimates/:id/edit` ou mode édition inline
- [ ] Toutes les sections éditables (items, description, etc.)
- [ ] Non accessible si devis verrouillé (message d'erreur)
- [ ] Sauvegarde avec recalcul des totaux
- [ ] Toast de confirmation
- [ ] Annulation retourne à la vue sans sauvegarder

#### Technical Notes
- Réutiliser les composants du formulaire de création
- API: PUT `/api/v1/estimates/:id`
- Vérifier les permissions (own ou role manager+)

---

### Story 4.11: Timer de temps passé

**Epic:** Devis  
**Priority:** P1  
**Effort:** S  

#### Description
As an **estimateur**, I want to see a timer of time spent on the estimate so that I meet productivity targets (10 min/$1000).

#### Acceptance Criteria
- [ ] Timer visible lors de la création/édition du devis
- [ ] Démarrage automatique à l'ouverture du formulaire
- [ ] Pause possible
- [ ] Temps cumulatif sauvegardé dans `timeSpentMin`
- [ ] Affichage format MM:SS ou HH:MM:SS
- [ ] Indicateur couleur: vert si dans les temps, orange/rouge si dépassement

#### Technical Notes
- Stocker en minutes (entier)
- Calcul cible: total devis / 100 = minutes cibles
- localStorage pour persistance pendant édition
- Mise à jour à chaque sauvegarde

---

## Résumé

| Story | Titre | Effort | Priority |
|-------|-------|--------|----------|
| 4.1 | API CRUD Devis | M | P0 |
| 4.2 | Formulaire de création de devis | L | P0 |
| 4.3 | Gestion des items de devis | M | P0 |
| 4.4 | Calcul automatique des totaux et taxes | S | P0 |
| 4.5 | Liste des devis | M | P0 |
| 4.6 | Fiche détail devis | M | P0 |
| 4.7 | Workflow de statuts | M | P0 |
| 4.8 | Verrouillage du prix convenu | S | P0 |
| 4.9 | Export PDF du devis | L | P0 |
| 4.10 | Modification d'un devis | M | P0 |
| 4.11 | Timer de temps passé | S | P1 |

**Total Stories:** 11  
**Effort estimé:** ~12-15 jours  

---

*Document créé par John (PM) — BMAD Method*
