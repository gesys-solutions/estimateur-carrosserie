# Epic 2: Auth & Users

**Projet:** EstimPro (estimateur-carrosserie)  
**Date:** 2026-02-04  
**Auteur:** John (Product Manager — BMAD)  
**Version:** 1.0  

---

## Objectif

Implémenter l'authentification et la gestion des utilisateurs : login/logout avec NextAuth.js, système de rôles (Admin, Manager, Estimateur), gestion des profils utilisateurs, et protection des routes.

**Valeur livrée :** À la fin de cet Epic, les utilisateurs peuvent se connecter de manière sécurisée, et l'accès aux fonctionnalités est contrôlé selon leur rôle.

---

## Requirements couverts

- **FR-018:** Login/logout (email + mot de passe)
- **FR-019:** Rôles utilisateurs (admin, manager, estimateur)
- **FR-020:** Gestion des comptes (CRUD par admin)
- **FR-021:** Isolation des données par atelier (multi-tenant)
- **NFR-010:** Authentification sécurisée (bcrypt, JWT)
- **NFR-011:** Autorisation RBAC
- **NFR-014:** Isolation multi-tenant
- **US-701, US-702, US-703, US-704**

---

## Dépendances

- **Epic 1: Foundation** doit être complété (Prisma, structure projet)

---

## Stories

---

### Story 2.1: Configuration NextAuth.js

**Epic:** Auth & Users  
**Priority:** P0  
**Effort:** M  

#### Description
As a **developer**, I want NextAuth.js v5 configured so that I have a robust authentication foundation.

#### Acceptance Criteria
- [ ] NextAuth.js v5 installé et configuré
- [ ] Fichier `lib/auth.ts` avec la configuration principale
- [ ] Route API `/api/auth/[...nextauth]` fonctionnelle
- [ ] Credentials provider configuré (email + password)
- [ ] Session strategy: JWT avec info stockée en DB
- [ ] Callbacks configurés: jwt, session (include role, tenantId)
- [ ] Types TypeScript étendus pour session personnalisée

#### Technical Notes
- Suivre la doc NextAuth v5 (beta/stable selon disponibilité)
- Étendre les types `next-auth.d.ts` pour role et tenantId
- Configurer NEXTAUTH_SECRET obligatoire
- Préparer les adaptateurs Prisma

---

### Story 2.2: Page de Login

**Epic:** Auth & Users  
**Priority:** P0  
**Effort:** S  

#### Description
As a **user**, I want to log in with my email and password so that I can access my account.

#### Acceptance Criteria
- [ ] Route `/login` avec formulaire email + password
- [ ] Validation côté client (email format, password non vide)
- [ ] Bouton "Se connecter" avec état loading
- [ ] Affichage des erreurs (credentials invalides, erreur serveur)
- [ ] Redirection vers `/` (dashboard) après login réussi
- [ ] Design responsive avec composants shadcn/ui
- [ ] Option "Mot de passe oublié" (lien placeholder pour v1.1)

#### Technical Notes
- Utiliser React Hook Form + Zod pour validation
- Composants: Input, Button, Card, Alert
- Appeler `signIn('credentials', ...)` de NextAuth
- Gérer les erreurs retournées par NextAuth

---

### Story 2.3: Hashage des mots de passe

**Epic:** Auth & Users  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want passwords hashed securely so that user credentials are protected.

#### Acceptance Criteria
- [ ] bcrypt installé pour le hashage
- [ ] Fonction `hashPassword(plaintext)` dans `lib/auth.ts`
- [ ] Fonction `verifyPassword(plaintext, hash)` pour vérification
- [ ] Salt rounds configuré à 12
- [ ] Tests unitaires pour hash/verify
- [ ] Aucun mot de passe en clair stocké en DB

#### Technical Notes
- Utiliser `bcryptjs` (compatible JS pur, pas de native deps)
- Hash au moment de la création/modification d'utilisateur
- Verify dans le credentials provider

---

### Story 2.4: Middleware de protection des routes

**Epic:** Auth & Users  
**Priority:** P0  
**Effort:** M  

#### Description
As a **user**, I want protected routes so that only authenticated users can access the application.

#### Acceptance Criteria
- [ ] Fichier `middleware.ts` à la racine
- [ ] Routes publiques: `/login`, `/api/auth/*`
- [ ] Routes protégées: tout le reste (dashboard, clients, etc.)
- [ ] Redirection vers `/login` si non authentifié
- [ ] Injection du `tenantId` dans les headers pour les API routes
- [ ] Vérification de session valide sur chaque requête

#### Technical Notes
- Utiliser `getToken` de NextAuth pour vérifier la session
- Matcher config pour exclure les assets statiques
- Logging des tentatives d'accès non autorisées

---

### Story 2.5: Système de rôles (RBAC)

**Epic:** Auth & Users  
**Priority:** P0  
**Effort:** M  

#### Description
As a **developer**, I want a role-based access control system so that different users have different permissions.

#### Acceptance Criteria
- [ ] Enum `Role` dans Prisma: ADMIN, MANAGER, ESTIMATOR
- [ ] Fichier `lib/permissions.ts` avec définition des permissions par rôle
- [ ] Helper `hasPermission(user, permission)` fonctionnel
- [ ] Hook `useCurrentUser()` retourne le rôle
- [ ] Composant `<RoleGate>` pour affichage conditionnel
- [ ] Middleware API vérifie les permissions sur les endpoints sensibles

#### Technical Notes
- Permissions exemple: `estimates:read:all`, `estimates:read:own`, `users:manage`
- RoleGate: `<RoleGate allow={['ADMIN', 'MANAGER']}>...</RoleGate>`
- Documenter la matrice de permissions

---

### Story 2.6: Logout et gestion de session

**Epic:** Auth & Users  
**Priority:** P0  
**Effort:** XS  

#### Description
As a **user**, I want to log out so that my session is terminated securely.

#### Acceptance Criteria
- [ ] Bouton "Déconnexion" dans le header/menu utilisateur
- [ ] Appel `signOut()` de NextAuth
- [ ] Redirection vers `/login` après logout
- [ ] Session invalidée côté serveur
- [ ] Confirmation visuelle (toast ou message)

#### Technical Notes
- Utiliser le hook `signOut` de next-auth/react
- Nettoyer tout state local au logout
- Optionnel: confirmation avant logout

---

### Story 2.7: Page de profil utilisateur

**Epic:** Auth & Users  
**Priority:** P0  
**Effort:** S  

#### Description
As a **user**, I want to view and edit my profile so that I can update my personal information.

#### Acceptance Criteria
- [ ] Route `/settings/profile` accessible à tous les utilisateurs authentifiés
- [ ] Affichage: nom, prénom, email, rôle (readonly)
- [ ] Modification: nom, prénom
- [ ] Option changer mot de passe (formulaire séparé)
- [ ] Validation des champs modifiés
- [ ] Confirmation de sauvegarde (toast)

#### Technical Notes
- API: PUT `/api/v1/users/me`
- Vérifier que l'utilisateur ne peut modifier que son propre profil
- Changement de mot de passe: ancien + nouveau + confirmation

---

### Story 2.8: Gestion des utilisateurs (Admin)

**Epic:** Auth & Users  
**Priority:** P0  
**Effort:** M  

#### Description
As an **admin**, I want to manage user accounts so that I can add, modify, and deactivate team members.

#### Acceptance Criteria
- [ ] Route `/settings/users` accessible uniquement aux ADMIN
- [ ] Liste des utilisateurs du tenant avec colonnes: nom, email, rôle, statut, dernière connexion
- [ ] Bouton "Ajouter un utilisateur" → formulaire modal
- [ ] Création: email, nom, prénom, rôle, mot de passe temporaire
- [ ] Modification: nom, prénom, rôle
- [ ] Désactivation: toggle isActive (soft delete)
- [ ] Réinitialisation de mot de passe (génère un nouveau temporaire)
- [ ] Pagination si >20 utilisateurs

#### Technical Notes
- API: GET/POST `/api/v1/users`, PUT/PATCH `/api/v1/users/:id`
- Email de bienvenue avec mot de passe temporaire (v1.1 — pour MVP afficher le mot de passe)
- Vérifier qu'un admin ne peut pas se désactiver lui-même
- Empêcher la suppression du dernier admin

---

### Story 2.9: Multi-tenant isolation

**Epic:** Auth & Users  
**Priority:** P0  
**Effort:** M  

#### Description
As a **developer**, I want tenant isolation enforced so that data from different workshops is completely separated.

#### Acceptance Criteria
- [ ] Chaque utilisateur appartient à un `tenantId`
- [ ] Toutes les requêtes DB incluent un filtre `tenantId`
- [ ] Helper `withTenant(query)` pour ajouter le filtre automatiquement
- [ ] Middleware injecte `tenantId` dans le contexte de requête
- [ ] Tests vérifiant qu'un user ne peut pas accéder aux données d'un autre tenant
- [ ] Erreur 403 si tentative d'accès cross-tenant

#### Technical Notes
- Prisma middleware pour injection automatique du tenantId
- Alternative: extension Prisma avec contexte
- Audit log pour tentatives d'accès cross-tenant

---

### Story 2.10: Seed d'utilisateurs de test

**Epic:** Auth & Users  
**Priority:** P1  
**Effort:** XS  

#### Description
As a **developer**, I want seed data for users so that I can test the application with different roles.

#### Acceptance Criteria
- [ ] Script `prisma/seed.ts` crée un tenant "Atelier Demo"
- [ ] 3 utilisateurs créés: admin@demo.com, manager@demo.com, estimateur@demo.com
- [ ] Mots de passe hashés (password: "password123" pour tous en dev)
- [ ] Chaque rôle représenté: ADMIN, MANAGER, ESTIMATOR
- [ ] Script idempotent (peut être relancé sans dupliquer)
- [ ] Commande `npm run db:seed` documentée

#### Technical Notes
- Utiliser `prisma db seed` avec ts-node
- Configurer dans package.json: `prisma.seed`
- Afficher les credentials créés dans la console

---

## Résumé

| Story | Titre | Effort | Priority |
|-------|-------|--------|----------|
| 2.1 | Configuration NextAuth.js | M | P0 |
| 2.2 | Page de Login | S | P0 |
| 2.3 | Hashage des mots de passe | S | P0 |
| 2.4 | Middleware de protection des routes | M | P0 |
| 2.5 | Système de rôles (RBAC) | M | P0 |
| 2.6 | Logout et gestion de session | XS | P0 |
| 2.7 | Page de profil utilisateur | S | P0 |
| 2.8 | Gestion des utilisateurs (Admin) | M | P0 |
| 2.9 | Multi-tenant isolation | M | P0 |
| 2.10 | Seed d'utilisateurs de test | XS | P1 |

**Total Stories:** 10  
**Effort estimé:** ~7-9 jours  

---

*Document créé par John (PM) — BMAD Method*
