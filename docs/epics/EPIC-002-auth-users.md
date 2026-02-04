# EPIC-002: Auth & Users

## Description

Implémentation du système d'authentification et de gestion des utilisateurs pour EstimPro. Cet Epic couvre le login/logout, la gestion des rôles (admin, manager, estimateur), les profils utilisateurs, et l'isolation multi-tenant des données.

## Acceptance Criteria

- [ ] Login fonctionnel avec email/mot de passe
- [ ] Logout avec invalidation de session
- [ ] 3 rôles implémentés: admin, manager, estimateur
- [ ] Protection des routes selon les rôles
- [ ] CRUD utilisateurs par admin
- [ ] Profil utilisateur éditable
- [ ] Isolation multi-tenant (tenant_id sur toutes les requêtes)
- [ ] Mots de passe hashés avec bcrypt
- [ ] Sessions JWT sécurisées

## Dependencies

- **EPIC-001:** Foundation (Next.js, Prisma, structure projet)

## Technical Notes

- NextAuth.js v5 (Auth.js) avec Credentials provider
- Prisma pour User, Tenant, Session
- Middleware Next.js pour protection des routes
- bcrypt pour hashing des mots de passe
- JWT avec refresh token

## Related PRD Requirements

- FR-018: Login/logout
- FR-019: Rôles utilisateurs (admin, manager, estimateur)
- FR-020: Gestion des comptes (CRUD par admin)
- FR-021: Isolation des données par atelier (multi-tenant)
- US-701, US-702, US-703, US-704

---

## Stories

### Story 1: Schema Prisma Auth

- **ID:** EPIC-002-S01
- **Estimate:** M
- **Description:** Étendre le schema Prisma avec les modèles complets pour User, Tenant, Session, et relations.
- **Acceptance Criteria:**
  - [ ] Modèle User: id, email, password, name, role, tenantId, isActive, createdAt, updatedAt
  - [ ] Modèle Tenant: id, name, slug, settings (JSON), createdAt
  - [ ] Modèle Session: id, userId, token, expiresAt
  - [ ] Enum Role: ADMIN, MANAGER, ESTIMATOR
  - [ ] Relations User → Tenant (belongsTo)
  - [ ] Indexes sur email (unique), tenantId
  - [ ] Migration appliquée avec succès

### Story 2: Configuration NextAuth.js

- **ID:** EPIC-002-S02
- **Estimate:** M
- **Description:** Installer et configurer NextAuth.js v5 avec le Credentials provider.
- **Acceptance Criteria:**
  - [ ] NextAuth.js v5 installé
  - [ ] Credentials provider configuré
  - [ ] Callbacks: jwt (inclure role, tenantId), session (exposer role, tenantId)
  - [ ] Pages personnalisées: signIn
  - [ ] Variables env: NEXTAUTH_SECRET, NEXTAUTH_URL
  - [ ] Fichier auth.ts avec config exportée

### Story 3: Page de Login

- **ID:** EPIC-002-S03
- **Estimate:** M
- **Description:** Créer la page de connexion avec formulaire email/mot de passe et gestion des erreurs.
- **Acceptance Criteria:**
  - [ ] Route `/login` ou `/auth/signin`
  - [ ] Formulaire avec validation (react-hook-form + zod)
  - [ ] Champs: email, mot de passe
  - [ ] Bouton "Se connecter" avec loading state
  - [ ] Messages d'erreur clairs (identifiants invalides, compte désactivé)
  - [ ] Redirection post-login vers dashboard
  - [ ] Branding EstimPro

### Story 4: Middleware de protection

- **ID:** EPIC-002-S04
- **Estimate:** M
- **Description:** Implémenter le middleware Next.js pour protéger les routes authentifiées et vérifier les rôles.
- **Acceptance Criteria:**
  - [ ] Middleware dans `middleware.ts`
  - [ ] Routes publiques: `/login`, `/api/auth/*`
  - [ ] Routes protégées: `/dashboard/*`, `/clients/*`, `/devis/*`, etc.
  - [ ] Redirection vers login si non authentifié
  - [ ] Vérification du rôle pour routes admin (`/admin/*`)

### Story 5: API CRUD Utilisateurs

- **ID:** EPIC-002-S05
- **Estimate:** L
- **Description:** Créer les endpoints API pour la gestion des utilisateurs (admin only).
- **Acceptance Criteria:**
  - [ ] `GET /api/users` — Liste des utilisateurs (même tenant)
  - [ ] `GET /api/users/[id]` — Détail utilisateur
  - [ ] `POST /api/users` — Créer utilisateur (admin)
  - [ ] `PATCH /api/users/[id]` — Modifier utilisateur (admin)
  - [ ] `DELETE /api/users/[id]` — Désactiver utilisateur (soft delete)
  - [ ] Validation des données (zod)
  - [ ] Vérification des permissions (admin only)
  - [ ] Hashage du mot de passe à la création

### Story 6: Page Gestion Utilisateurs

- **ID:** EPIC-002-S06
- **Estimate:** L
- **Description:** Interface admin pour lister, créer, modifier et désactiver les utilisateurs.
- **Acceptance Criteria:**
  - [ ] Route `/admin/users`
  - [ ] Tableau des utilisateurs (nom, email, rôle, statut, date création)
  - [ ] Bouton "Ajouter utilisateur" → Dialog formulaire
  - [ ] Actions par ligne: Modifier, Désactiver/Réactiver
  - [ ] Dialog confirmation pour désactivation
  - [ ] Filtres: par rôle, par statut actif/inactif
  - [ ] Accessible uniquement aux admins

### Story 7: Page Profil Utilisateur

- **ID:** EPIC-002-S07
- **Estimate:** M
- **Description:** Page permettant à chaque utilisateur de voir et modifier son profil.
- **Acceptance Criteria:**
  - [ ] Route `/profile`
  - [ ] Affichage: nom, email, rôle (lecture seule)
  - [ ] Formulaire édition: nom, email
  - [ ] Changement de mot de passe (ancien + nouveau + confirmation)
  - [ ] Validation et feedback (toast success/error)

### Story 8: Logout et Session

- **ID:** EPIC-002-S08
- **Estimate:** S
- **Description:** Implémenter la déconnexion et la gestion de session expirée.
- **Acceptance Criteria:**
  - [ ] Bouton Logout dans le header/menu
  - [ ] Appel NextAuth signOut()
  - [ ] Redirection vers `/login` après logout
  - [ ] Gestion session expirée (redirect automatique)
  - [ ] Clear des données côté client (query cache)

### Story 9: Hook useCurrentUser

- **ID:** EPIC-002-S09
- **Estimate:** S
- **Description:** Créer un hook React pour accéder facilement aux infos de l'utilisateur courant.
- **Acceptance Criteria:**
  - [ ] Hook `useCurrentUser()` dans `src/hooks/`
  - [ ] Retourne: user, isLoading, isAuthenticated
  - [ ] Inclut: id, name, email, role, tenantId
  - [ ] Utilise useSession de NextAuth
  - [ ] Typage TypeScript complet

### Story 10: Seed Admin Initial

- **ID:** EPIC-002-S10
- **Estimate:** S
- **Description:** Script de seed pour créer un tenant et un admin initial.
- **Acceptance Criteria:**
  - [ ] Script `prisma/seed.ts`
  - [ ] Création d'un tenant "Demo Atelier"
  - [ ] Création d'un admin: admin@demo.com / password sécurisé
  - [ ] Configuration `prisma db seed`
  - [ ] Documentation dans README

---

## Estimation Summary

| Size | Count | Stories |
|------|-------|---------|
| S | 3 | S08, S09, S10 |
| M | 5 | S01, S02, S03, S04, S07 |
| L | 2 | S05, S06 |

**Total: 10 stories**

---

*EPIC créé par John (PM) — BMAD Method*  
*Projet: EstimPro (estimateur-carrosserie)*  
*Date: 2026-02-04*
