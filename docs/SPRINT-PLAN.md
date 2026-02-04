# Sprint Plan — EstimPro (estimateur-carrosserie)

**Projet:** EstimPro  
**Date:** 2026-02-04  
**Auteur:** Bob (Scrum Master — BMAD)  
**Version:** 1.0  
**Mode:** Autopilot AI

---

## Vue d'ensemble

Ce document organise l'implémentation des 7 Epics (70 stories) du projet EstimPro. 

### Mode d'exécution : Autopilot AI

Puisque c'est un **agent AI (Amelia)** qui implémente — et non une équipe humaine avec des sprints de 2 semaines — l'organisation suit un modèle **Epic-by-Epic** plutôt que sprint traditionnel.

**Avantages de cette approche :**
- ✅ Pas de context switching entre features non liées
- ✅ Chaque Epic est un livrable testable indépendamment
- ✅ Les dépendances sont respectées naturellement
- ✅ Smoke tests après chaque Epic garantissent la stabilité
- ✅ Rollback facile si un Epic pose problème

---

## Ordre d'implémentation

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 1: FONDATIONS                       │
│  Epic 1: Foundation ──► Epic 2: Auth & Users                │
│     (prérequis)           (sécurité)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 2: CORE BUSINESS                    │
│  Epic 3: Clients ──► Epic 4: Devis ──► Epic 5: Assurances   │
│    (entité base)      (cœur produit)    (extension)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 3: VALEUR AJOUTÉE                   │
│  Epic 6: Dashboard ──► Epic 7: Leads                        │
│    (métriques)          (conversion)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Epic 1: Foundation

**Objectif :** Mettre en place les fondations techniques du projet.

**Prérequis :** Aucun — c'est le premier Epic.

**Stories (10) :**

| # | Story | Effort | Priority |
|---|-------|--------|----------|
| 1.1 | Initialisation Next.js 16 | S | P0 |
| 1.2 | Configuration Tailwind CSS 4 | XS | P0 |
| 1.3 | Installation shadcn/ui | S | P0 |
| 1.4 | Setup Prisma avec schema | M | P0 |
| 1.5 | Structure de dossiers | S | P0 |
| 1.6 | ESLint et Prettier | XS | P0 |
| 1.7 | Dockerfile et docker-compose | M | P0 |
| 1.8 | Variables d'environnement | XS | P0 |
| 1.9 | Page d'accueil placeholder | XS | P0 |
| 1.10 | GitHub Actions CI | S | P1 |

**Effort total :** ~5-7 jours

**Critères de Done :**
- [ ] `npm run dev` démarre l'app sur localhost:3000
- [ ] `docker compose up` fonctionne
- [ ] `npm run lint` passe sans erreur
- [ ] Prisma migrations appliquées
- [ ] CI GitHub Actions green

**Smoke Test :**
- App démarre localement
- Page d'accueil s'affiche avec le nom "EstimPro"
- Container Docker build et run

---

## Epic 2: Auth & Users

**Objectif :** Authentification sécurisée et gestion des rôles.

**Prérequis :** Epic 1 (Prisma, structure projet)

**Justification de la position :**
- Tous les autres Epics ont besoin d'utilisateurs authentifiés
- L'isolation multi-tenant doit être en place AVANT de créer des données business
- Les rôles (ADMIN, MANAGER, ESTIMATOR) conditionnent l'accès aux features

**Stories (10) :**

| # | Story | Effort | Priority |
|---|-------|--------|----------|
| 2.1 | Configuration NextAuth.js | M | P0 |
| 2.2 | Page de Login | S | P0 |
| 2.3 | Hashage des mots de passe | S | P0 |
| 2.4 | Middleware protection routes | M | P0 |
| 2.5 | Système de rôles (RBAC) | M | P0 |
| 2.6 | Logout et gestion session | XS | P0 |
| 2.7 | Page de profil utilisateur | S | P0 |
| 2.8 | Gestion utilisateurs (Admin) | M | P0 |
| 2.9 | Multi-tenant isolation | M | P0 |
| 2.10 | Seed utilisateurs de test | XS | P1 |

**Effort total :** ~7-9 jours

**Critères de Done :**
- [ ] Login/logout fonctionnel
- [ ] Routes protégées (redirect si non auth)
- [ ] 3 rôles fonctionnels (admin, manager, estimator)
- [ ] Isolation par tenant vérifiée
- [ ] Seed crée admin@demo.com, manager@demo.com, estimateur@demo.com

**Smoke Test :**
- Login avec credentials de test
- Accès refusé aux routes protégées sans auth
- Admin peut créer/modifier des users
- Estimateur ne voit pas le menu admin

---

## Epic 3: Clients

**Objectif :** Gestion complète des clients et véhicules.

**Prérequis :** Epic 2 (authentification, multi-tenant)

**Justification de la position :**
- Les devis (Epic 4) nécessitent un client et un véhicule
- Entité de base sans dépendance sur les features "métier"
- Permet de tester l'architecture CRUD avant le cœur du produit

**Stories (10) :**

| # | Story | Effort | Priority |
|---|-------|--------|----------|
| 3.1 | API CRUD Clients | M | P0 |
| 3.2 | Formulaire création client | M | P0 |
| 3.3 | Liste des clients | M | P0 |
| 3.4 | Recherche de clients | M | P0 |
| 3.5 | Fiche détail client | M | P0 |
| 3.6 | Modification d'un client | S | P0 |
| 3.7 | API CRUD Véhicules | S | P0 |
| 3.8 | Ajout/modification véhicule | S | P0 |
| 3.9 | Suppression client/véhicule | XS | P0 |
| 3.10 | Historique devis client | S | P1 |

**Effort total :** ~7-9 jours

**Critères de Done :**
- [ ] CRUD clients complet (create, read, update, delete)
- [ ] CRUD véhicules associés aux clients
- [ ] Recherche par nom, téléphone, immatriculation
- [ ] Isolation par tenant fonctionnelle
- [ ] Données seed pour tests

**Smoke Test :**
- Créer un client avec nom, téléphone, email
- Ajouter un véhicule au client
- Rechercher le client par téléphone
- Voir la fiche client avec ses véhicules

---

## Epic 4: Devis

**Objectif :** Cœur du produit — création et gestion des devis.

**Prérequis :** Epic 3 (clients et véhicules)

**Justification de la position :**
- C'est la feature principale de l'application
- Dépend des clients/véhicules pour les FK obligatoires
- Base pour les Epics 5 (Assurances), 6 (Dashboard), 7 (Leads)

**Stories (11) :**

| # | Story | Effort | Priority |
|---|-------|--------|----------|
| 4.1 | API CRUD Devis | M | P0 |
| 4.2 | Formulaire création devis | L | P0 |
| 4.3 | Gestion items (LineItems) | M | P0 |
| 4.4 | Calcul totaux et taxes | S | P0 |
| 4.5 | Liste des devis | M | P0 |
| 4.6 | Fiche détail devis | M | P0 |
| 4.7 | Workflow de statuts | M | P0 |
| 4.8 | Verrouillage prix convenu | S | P0 |
| 4.9 | Export PDF | L | P0 |
| 4.10 | Modification devis | M | P0 |
| 4.11 | Timer temps passé | S | P1 |

**Effort total :** ~12-15 jours

**Critères de Done :**
- [ ] Création devis avec sélection client/véhicule
- [ ] Ajout/modification/suppression items
- [ ] Calcul automatique TPS/TVQ
- [ ] 10 statuts avec transitions valides
- [ ] Export PDF professionnel
- [ ] Verrouillage après accord

**Smoke Test :**
- Créer un devis pour un client existant
- Ajouter 3 items (main d'œuvre, pièce, peinture)
- Voir le total avec taxes
- Changer le statut DRAFT → SUBMITTED
- Exporter en PDF

---

## Epic 5: Assurances

**Objectif :** Gestion des assureurs et réclamations.

**Prérequis :** Epic 4 (devis existants)

**Justification de la position :**
- Extension des devis — impossible sans Epic 4
- Les négociations et prix convenus sont liés aux devis
- Feature métier spécifique au domaine carrosserie

**Stories (9) :**

| # | Story | Effort | Priority |
|---|-------|--------|----------|
| 5.1 | API CRUD Compagnies assurance | S | P0 |
| 5.2 | Gestion compagnies (UI) | M | P0 |
| 5.3 | API réclamations (Claims) | S | P0 |
| 5.4 | Associer réclamation à devis | M | P0 |
| 5.5 | Saisie prix convenu | S | P0 |
| 5.6 | API historique négociations | S | P0 |
| 5.7 | Interface historique négos | M | P0 |
| 5.8 | Statistiques par assureur | M | P1 |
| 5.9 | Seed assureurs principaux | XS | P1 |

**Effort total :** ~6-8 jours

**Critères de Done :**
- [ ] CRUD compagnies d'assurance
- [ ] Association réclamation ↔ devis
- [ ] Saisie du prix convenu après négociation
- [ ] Historique des négociations (timeline)
- [ ] Seed avec 8 assureurs québécois

**Smoke Test :**
- Créer une compagnie d'assurance (Intact)
- Lier un devis à une réclamation Intact
- Ajouter une note de négociation
- Saisir le prix convenu

---

## Epic 6: Dashboard

**Objectif :** Tableau de bord avec KPIs et métriques.

**Prérequis :** Epic 4 (données devis pour les stats)

**Justification de la position :**
- Agrégation des données des Epics précédents
- Ne bloque aucune autre feature
- Valeur ajoutée pour les managers

**Stories (10) :**

| # | Story | Effort | Priority |
|---|-------|--------|----------|
| 6.1 | API Dashboard - Stats jour | S | P0 |
| 6.2 | API Dashboard - Compteurs statut | S | P0 |
| 6.3 | API Dashboard - Stats estimateur | S | P0 |
| 6.4 | Page Dashboard principale | L | P0 |
| 6.5 | Cartes KPI avec indicateurs | M | P0 |
| 6.6 | Compteurs par statut (visuel) | S | P0 |
| 6.7 | Tableau devis récents | S | P0 |
| 6.8 | Graphique évolution hebdo | M | P1 |
| 6.9 | KPIs personnels (estimateur) | S | P1 |
| 6.10 | Dashboard responsive | S | P0 |

**Effort total :** ~7-9 jours

**Critères de Done :**
- [ ] Dashboard affiche les KPIs du jour
- [ ] Compteurs par statut avec couleurs
- [ ] Stats par estimateur (managers)
- [ ] Graphique 7 derniers jours
- [ ] Responsive tablet/mobile

**Smoke Test :**
- Dashboard affiche "X devis créés aujourd'hui"
- Clic sur compteur statut → filtre la liste
- Manager voit les stats de tous les estimateurs
- Graphique affiche les données de la semaine

---

## Epic 7: Leads (Suivi)

**Objectif :** Suivi des devis non convertis et système de relances.

**Prérequis :** Epic 4 (devis et statuts)

**Justification de la position :**
- Extension du module Devis
- Dernier Epic car feature "nice-to-have" vs core
- Peut être déployé en v1.1 si timing serré

**Stories (10) :**

| # | Story | Effort | Priority |
|---|-------|--------|----------|
| 7.1 | API liste leads | S | P0 |
| 7.2 | Page liste leads | M | P0 |
| 7.3 | Modèle FollowUp | S | P0 |
| 7.4 | API CRUD relances | S | P0 |
| 7.5 | Interface suivi (relance) | M | P0 |
| 7.6 | Marquage comme perdu | S | P0 |
| 7.7 | Statistiques leads perdus | M | P1 |
| 7.8 | Alertes devis en attente | M | P1 |
| 7.9 | Export liste leads | S | P1 |
| 7.10 | Relances planifiées (calendrier) | M | P2 |

**Effort total :** ~7-9 jours

**Critères de Done :**
- [ ] Liste des leads > 7 jours
- [ ] Ajout notes de relance
- [ ] Marquage "perdu" avec raison
- [ ] Badge notification leads en attente
- [ ] Export CSV fonctionnel

**Smoke Test :**
- Voir la liste des devis non convertis
- Ajouter une note de relance (appel téléphonique)
- Marquer un devis comme "perdu - prix trop élevé"
- Voir le badge de notification sur le menu Leads

---

## Récapitulatif global

| Epic | Nom | Stories | Effort | Priorité |
|------|-----|---------|--------|----------|
| 1 | Foundation | 10 | 5-7j | 🔴 Critique |
| 2 | Auth & Users | 10 | 7-9j | 🔴 Critique |
| 3 | Clients | 10 | 7-9j | 🔴 Critique |
| 4 | Devis | 11 | 12-15j | 🔴 Critique |
| 5 | Assurances | 9 | 6-8j | 🟠 Important |
| 6 | Dashboard | 10 | 7-9j | 🟠 Important |
| 7 | Leads | 10 | 7-9j | 🟡 Nice-to-have |

**Total :** 70 stories, ~52-66 jours d'effort estimé

---

## Dépendances entre Epics

```
Epic 1 (Foundation)
    │
    └──► Epic 2 (Auth)
              │
              └──► Epic 3 (Clients)
                        │
                        └──► Epic 4 (Devis)
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
              Epic 5        Epic 6        Epic 7
            (Assurances)   (Dashboard)    (Leads)
```

**Règles de dépendances :**
- Epic 2 dépend strictement de Epic 1
- Epic 3 dépend strictement de Epic 2
- Epic 4 dépend strictement de Epic 3
- Epics 5, 6, 7 dépendent de Epic 4 mais sont indépendants entre eux

---

## Gates et Smoke Tests

Après chaque Epic, un **smoke test** obligatoire valide :

| Epic | Smoke Test Gate |
|------|-----------------|
| 1 | App démarre, page s'affiche, Docker build |
| 2 | Login fonctionne, routes protégées |
| 3 | CRUD clients/véhicules, recherche |
| 4 | Créer devis, items, PDF, statuts |
| 5 | Lier assurance, négociations, prix convenu |
| 6 | Dashboard métriques, responsive |
| 7 | Leads list, relances, export |

**Règle :** Si un smoke test échoue, l'Epic n'est pas considéré "done" et on ne passe pas au suivant.

---

## Finalisation (post-Epic 7)

| Étape | Description |
|-------|-------------|
| Integration Test | Test E2E de tous les flows principaux |
| Finalize | README, docs déploiement, tag v1.0.0 |
| Build Docker | Build et test container final |

---

## Timeline estimée (mode Autopilot AI)

En mode AI continu (pas de weekends, pas de fatigue) :

| Semaine | Epic | Cumul |
|---------|------|-------|
| S1 | Foundation + Auth | 2/7 |
| S2 | Clients + Devis (1/2) | 3/7 |
| S3 | Devis (2/2) + Assurances | 5/7 |
| S4 | Dashboard + Leads | 7/7 |
| S5 | Tests E2E + Finalisation | ✅ |

**Durée totale estimée :** 4-5 semaines

---

*Document créé par Bob (Scrum Master) — BMAD Method*
