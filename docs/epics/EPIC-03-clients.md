# Epic 3: Clients

**Projet:** EstimPro (estimateur-carrosserie)  
**Date:** 2026-02-04  
**Auteur:** John (Product Manager — BMAD)  
**Version:** 1.0  

---

## Objectif

Implémenter la gestion complète des clients et de leurs véhicules : création rapide de fiches clients, association de véhicules, recherche instantanée, et visualisation de l'historique.

**Valeur livrée :** À la fin de cet Epic, les estimateurs peuvent créer et gérer les fiches clients rapidement, associer des véhicules, et retrouver n'importe quel client en quelques secondes.

---

## Requirements couverts

- **FR-001:** Créer, modifier, supprimer une fiche client
- **FR-002:** Associer véhicules à un client
- **FR-003:** Recherche clients (nom, téléphone, immatriculation)
- **US-101, US-102, US-103, US-104**

---

## Dépendances

- **Epic 1: Foundation** — Structure projet, Prisma
- **Epic 2: Auth & Users** — Authentification, multi-tenant

---

## Stories

---

### Story 3.1: API CRUD Clients

**Epic:** Clients  
**Priority:** P0  
**Effort:** M  

#### Description
As a **developer**, I want a complete CRUD API for clients so that I can manage client data from the frontend.

#### Acceptance Criteria
- [ ] Route `GET /api/v1/clients` — Liste paginée des clients du tenant
- [ ] Route `GET /api/v1/clients/:id` — Détail d'un client avec ses véhicules
- [ ] Route `POST /api/v1/clients` — Création d'un nouveau client
- [ ] Route `PUT /api/v1/clients/:id` — Modification d'un client
- [ ] Route `DELETE /api/v1/clients/:id` — Suppression (soft delete ou cascade)
- [ ] Validation Zod sur les inputs
- [ ] Isolation par tenant automatique
- [ ] Réponses standardisées (format JSON avec data/error/pagination)

#### Technical Notes
- Champs Client: firstName, lastName, phone, email, address, city, postalCode, notes
- Pagination: `?page=1&limit=20`
- Inclure count total pour la pagination
- Gérer les cas d'erreur (404, 400, 500)

---

### Story 3.2: Formulaire de création de client

**Epic:** Clients  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to create a client record quickly so that I can start the file without delay.

#### Acceptance Criteria
- [ ] Route `/clients/new` avec formulaire de création
- [ ] Champs: Prénom*, Nom*, Téléphone, Email, Adresse, Ville, Code postal, Notes
- [ ] Validation en temps réel (format email, format téléphone)
- [ ] Bouton "Créer" avec état loading
- [ ] Toast de confirmation après création
- [ ] Redirection vers la fiche client créée
- [ ] Bouton "Annuler" retourne à la liste

#### Technical Notes
- Utiliser React Hook Form + Zod
- Composants shadcn: Input, Button, Card, Form, Textarea
- Format téléphone: accepter (xxx) xxx-xxxx ou xxx-xxx-xxxx
- Masque de saisie optionnel pour téléphone

---

### Story 3.3: Liste des clients

**Epic:** Clients  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to see a list of all clients so that I can browse and find existing clients.

#### Acceptance Criteria
- [ ] Route `/clients` affiche la liste paginée
- [ ] Colonnes: Nom complet, Téléphone, Email, Ville, Nb véhicules, Date création
- [ ] Pagination (20 clients par page par défaut)
- [ ] Tri par colonne (nom, date création)
- [ ] Ligne cliquable → fiche client
- [ ] Bouton "Nouveau client" proéminent
- [ ] État vide si aucun client ("Aucun client pour le moment")

#### Technical Notes
- Utiliser TanStack Table ou composant DataTable shadcn
- Hook `useClients()` avec TanStack Query
- Cache avec staleTime approprié
- Skeleton loading pendant chargement

---

### Story 3.4: Recherche de clients

**Epic:** Clients  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to search for a client by name, phone, or license plate so that I can find them instantly.

#### Acceptance Criteria
- [ ] Barre de recherche en haut de la liste clients
- [ ] Recherche en temps réel (debounce 300ms)
- [ ] Recherche sur: nom, prénom, téléphone, immatriculation véhicule
- [ ] Résultats filtrés instantanément
- [ ] Highlight du terme recherché dans les résultats
- [ ] Message "Aucun résultat" si recherche vide
- [ ] API `GET /api/v1/clients/search?q=...`

#### Technical Notes
- Debounce côté client pour limiter les requêtes
- Recherche case-insensitive
- Utiliser ILIKE en PostgreSQL, LIKE en SQLite
- Indexer les colonnes de recherche

---

### Story 3.5: Fiche détail client

**Epic:** Clients  
**Priority:** P0  
**Effort:** M  

#### Description
As an **estimateur**, I want to view a client's complete profile so that I know their history before meeting them.

#### Acceptance Criteria
- [ ] Route `/clients/:id` affiche toutes les informations du client
- [ ] Sections: Informations personnelles, Véhicules, Historique devis
- [ ] Liste des véhicules associés avec actions (modifier, supprimer)
- [ ] Liste des devis liés (preview: numéro, date, statut, montant)
- [ ] Bouton "Modifier" pour éditer le client
- [ ] Bouton "Nouveau devis" raccourci
- [ ] Bouton "Ajouter véhicule"

#### Technical Notes
- Charger client avec véhicules et devis en une requête (include Prisma)
- Limiter les devis affichés aux 10 derniers + lien "Voir tout"
- Utiliser Card/Tabs shadcn pour les sections

---

### Story 3.6: Modification d'un client

**Epic:** Clients  
**Priority:** P0  
**Effort:** S  

#### Description
As an **estimateur**, I want to edit a client's information so that I can keep their data up to date.

#### Acceptance Criteria
- [ ] Route `/clients/:id/edit` ou modal d'édition
- [ ] Formulaire pré-rempli avec les données actuelles
- [ ] Mêmes validations que création
- [ ] Bouton "Sauvegarder" avec état loading
- [ ] Toast de confirmation après modification
- [ ] Retour à la fiche client
- [ ] Annulation possible sans sauvegarder

#### Technical Notes
- Réutiliser le composant formulaire de création
- Appel PUT `/api/v1/clients/:id`
- Optimistic update possible avec TanStack Query

---

### Story 3.7: API CRUD Véhicules

**Epic:** Clients  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want a CRUD API for vehicles so that I can manage vehicles associated with clients.

#### Acceptance Criteria
- [ ] Route `GET /api/v1/clients/:clientId/vehicles` — Liste des véhicules
- [ ] Route `POST /api/v1/clients/:clientId/vehicles` — Ajout d'un véhicule
- [ ] Route `PUT /api/v1/vehicles/:id` — Modification
- [ ] Route `DELETE /api/v1/vehicles/:id` — Suppression
- [ ] Validation: véhicule appartient au bon client/tenant
- [ ] Validation Zod sur les inputs

#### Technical Notes
- Champs Vehicle: make, model, year, vin, plate, color, mileage
- VIN: 17 caractères (validation optionnelle)
- Plaque: format libre (varie par province)

---

### Story 3.8: Ajout et modification de véhicule

**Epic:** Clients  
**Priority:** P0  
**Effort:** S  

#### Description
As an **estimateur**, I want to add and edit vehicles for a client so that I have their complete vehicle history.

#### Acceptance Criteria
- [ ] Modal ou page pour ajouter un véhicule depuis la fiche client
- [ ] Champs: Marque*, Modèle*, Année*, VIN, Immatriculation, Couleur, Kilométrage
- [ ] Validation: année entre 1900 et année courante+1
- [ ] Bouton "Ajouter" avec loading
- [ ] Confirmation toast
- [ ] Liste des véhicules mise à jour instantanément
- [ ] Édition inline ou modal pour modifier

#### Technical Notes
- Dropdown ou autocomplete pour Marque (liste commune)
- Modèle: champ texte libre
- Année: input number ou select des 30 dernières années

---

### Story 3.9: Suppression de client et véhicule

**Epic:** Clients  
**Priority:** P0  
**Effort:** XS  

#### Description
As an **estimateur**, I want to delete clients and vehicles so that I can clean up erroneous data.

#### Acceptance Criteria
- [ ] Bouton supprimer sur véhicule avec confirmation modal
- [ ] Suppression effective après confirmation
- [ ] Pour clients: vérifier s'il y a des devis associés
- [ ] Si devis existants: avertir que le client ne peut pas être supprimé (intégrité)
- [ ] Alternative: soft delete (isDeleted flag) pour conserver l'historique
- [ ] Toast de confirmation

#### Technical Notes
- Décision: soft delete recommandé pour les clients (traçabilité)
- Hard delete acceptable pour véhicules sans devis
- Cascade delete pour véhicules si client supprimé

---

### Story 3.10: Historique des devis d'un client

**Epic:** Clients  
**Priority:** P1  
**Effort:** S  

#### Description
As an **estimateur**, I want to see a client's estimate history so that I know their profile before meeting them.

#### Acceptance Criteria
- [ ] Section "Historique des devis" sur la fiche client
- [ ] Tableau: Numéro devis, Véhicule, Date, Statut (badge couleur), Montant
- [ ] Tri par date (plus récent en premier)
- [ ] Clic sur une ligne → détail du devis
- [ ] Statistiques rapides: nombre total de devis, montant cumulé, taux conversion
- [ ] Filtrage par statut optionnel

#### Technical Notes
- Charger les 10 derniers devis par défaut
- Pagination si plus de 10
- Calcul taux conversion: approved / (total - draft)

---

## Résumé

| Story | Titre | Effort | Priority |
|-------|-------|--------|----------|
| 3.1 | API CRUD Clients | M | P0 |
| 3.2 | Formulaire de création de client | M | P0 |
| 3.3 | Liste des clients | M | P0 |
| 3.4 | Recherche de clients | M | P0 |
| 3.5 | Fiche détail client | M | P0 |
| 3.6 | Modification d'un client | S | P0 |
| 3.7 | API CRUD Véhicules | S | P0 |
| 3.8 | Ajout et modification de véhicule | S | P0 |
| 3.9 | Suppression de client et véhicule | XS | P0 |
| 3.10 | Historique des devis d'un client | S | P1 |

**Total Stories:** 10  
**Effort estimé:** ~7-9 jours  

---

*Document créé par John (PM) — BMAD Method*
