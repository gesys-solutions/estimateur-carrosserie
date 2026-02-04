# Epic 1: Foundation

**Projet:** EstimPro (estimateur-carrosserie)  
**Date:** 2026-02-04  
**Auteur:** John (Product Manager — BMAD)  
**Version:** 1.0  

---

## Objectif

Mettre en place les fondations techniques du projet : initialisation Next.js 16 avec App Router, configuration Tailwind CSS 4, setup Prisma avec schema initial, structure de dossiers, Dockerfile, et environnement de développement Docker Compose.

**Valeur livrée :** À la fin de cet Epic, l'équipe dispose d'un squelette d'application fonctionnel qu'on peut démarrer localement et builder en container Docker.

---

## Requirements couverts

- **NFR-040:** Code quality — ESLint + Prettier
- **NFR-041:** Documentation — README
- **NFR-042:** Déploiement — CI/CD automatisé (préparation)
- Infrastructure de base pour tous les autres Epics

---

## Dépendances

Aucune — c'est le premier Epic.

---

## Stories

---

### Story 1.1: Initialisation du projet Next.js 16

**Epic:** Foundation  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want to have a Next.js 16 project initialized with App Router so that I can start building the application with the modern React architecture.

#### Acceptance Criteria
- [ ] Projet créé avec `create-next-app` version 16
- [ ] App Router activé (dossier `app/`)
- [ ] TypeScript configuré en mode strict
- [ ] `package.json` contient Next.js 16, React 19, TypeScript 5
- [ ] Commande `npm run dev` démarre l'app sur localhost:3000
- [ ] Page d'accueil par défaut s'affiche correctement

#### Technical Notes
- Utiliser `npx create-next-app@latest --typescript --app`
- Vérifier la compatibilité Node 22 LTS
- Configurer `next.config.ts` pour output standalone (Docker)

---

### Story 1.2: Configuration Tailwind CSS 4

**Epic:** Foundation  
**Priority:** P0  
**Effort:** XS  

#### Description
As a **developer**, I want Tailwind CSS 4 configured so that I can style components efficiently with utility classes.

#### Acceptance Criteria
- [ ] Tailwind CSS 4 installé et configuré
- [ ] Fichier `tailwind.config.ts` créé avec les paths corrects
- [ ] `globals.css` contient les directives Tailwind (@tailwind base, components, utilities)
- [ ] Classes Tailwind fonctionnent sur la page d'accueil test
- [ ] Dark mode configuré (class strategy)

#### Technical Notes
- Suivre la doc Tailwind v4 pour la config
- Préparer les variables CSS pour le design system
- Configurer les fonts (Inter recommandé)

---

### Story 1.3: Installation et configuration shadcn/ui

**Epic:** Foundation  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want shadcn/ui set up so that I can use accessible, customizable components without external dependencies.

#### Acceptance Criteria
- [ ] shadcn/ui initialisé (`npx shadcn-ui@latest init`)
- [ ] Dossier `components/ui/` créé
- [ ] Theme configuré (couleurs, border radius)
- [ ] Composants de base installés: Button, Input, Card, Form
- [ ] Fichier `lib/utils.ts` avec helper `cn()` présent
- [ ] Un composant Button s'affiche correctement sur une page test

#### Technical Notes
- Choisir le style "new-york" (plus moderne)
- Configurer les chemins d'import selon notre structure
- Préparer les tokens CSS pour customisation future

---

### Story 1.4: Setup Prisma avec schema initial

**Epic:** Foundation  
**Priority:** P0  
**Effort:** M  

#### Description
As a **developer**, I want Prisma ORM configured with the initial database schema so that I can interact with the database in a type-safe manner.

#### Acceptance Criteria
- [ ] Prisma installé (`@prisma/client`, `prisma` dev)
- [ ] Fichier `prisma/schema.prisma` créé avec toutes les entités du ARCHITECTURE.md
- [ ] Provider configuré pour SQLite (dev) et PostgreSQL (prod)
- [ ] Prisma Client généré sans erreurs
- [ ] Migration initiale créée et appliquée
- [ ] Fichier `lib/prisma.ts` avec singleton pattern pour le client
- [ ] Seed script basique pour données de test

#### Technical Notes
- Entités: Tenant, User, Session, Client, Vehicle, Estimate, LineItem, Insurer, Claim, Negotiation, Signature, AuditLog
- Utiliser `datasource db { provider = "sqlite" }` pour dev local
- Script de migration: `npx prisma migrate dev --name init`

---

### Story 1.5: Structure de dossiers projet

**Epic:** Foundation  
**Priority:** P0  
**Effort:** S  

#### Description
As a **developer**, I want a well-organized folder structure so that the codebase is maintainable and follows Next.js best practices.

#### Acceptance Criteria
- [ ] Structure `app/` avec route groups: `(auth)/`, `(dashboard)/`
- [ ] Dossier `components/` avec sous-dossiers: `ui/`, `layout/`, `shared/`
- [ ] Dossier `lib/` pour utilities et configurations
- [ ] Dossier `hooks/` pour les custom hooks
- [ ] Dossier `types/` pour les types TypeScript partagés
- [ ] Dossier `prisma/` pour schema et migrations
- [ ] README.md mis à jour avec la structure

#### Technical Notes
- Suivre la structure définie dans ARCHITECTURE.md section 6.1
- Créer les fichiers `.gitkeep` dans les dossiers vides
- Documenter les conventions de nommage

---

### Story 1.6: Configuration ESLint et Prettier

**Epic:** Foundation  
**Priority:** P0  
**Effort:** XS  

#### Description
As a **developer**, I want ESLint and Prettier configured so that the code style is consistent across the team.

#### Acceptance Criteria
- [ ] ESLint configuré avec les règles Next.js recommandées
- [ ] Prettier installé et configuré
- [ ] Fichiers `.eslintrc.json` et `.prettierrc` présents
- [ ] Scripts npm: `lint`, `lint:fix`, `format`
- [ ] VSCode settings recommandés dans `.vscode/settings.json`
- [ ] Commandes `npm run lint` et `npm run format` fonctionnent sans erreurs

#### Technical Notes
- Activer les règles TypeScript strict
- Configurer l'intégration ESLint + Prettier (eslint-config-prettier)
- Ignorer les fichiers générés (.next, node_modules, prisma/migrations)

---

### Story 1.7: Dockerfile et docker-compose.yml

**Epic:** Foundation  
**Priority:** P0  
**Effort:** M  

#### Description
As a **developer**, I want a Docker setup so that I can run the application in a containerized environment identical to production.

#### Acceptance Criteria
- [ ] `Dockerfile` multi-stage (builder + runner) créé
- [ ] Image basée sur Node 22 Alpine
- [ ] Output standalone Next.js configuré
- [ ] `docker-compose.yml` pour dev local avec app + PostgreSQL optionnel
- [ ] Volume pour base SQLite en développement
- [ ] Commande `docker compose up` démarre l'app fonctionnelle
- [ ] Image finale < 200MB

#### Technical Notes
- Suivre le Dockerfile de ARCHITECTURE.md section 8.2
- User non-root (nextjs:nodejs)
- Variables d'environnement: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- Healthcheck endpoint à prévoir

---

### Story 1.8: Configuration des variables d'environnement

**Epic:** Foundation  
**Priority:** P0  
**Effort:** XS  

#### Description
As a **developer**, I want environment variables properly configured so that secrets are managed securely.

#### Acceptance Criteria
- [ ] Fichier `.env.example` avec toutes les variables documentées
- [ ] Fichier `.env.local` créé localement (gitignored)
- [ ] Variables minimales: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- [ ] Validation des variables au démarrage avec Zod
- [ ] Documentation dans README sur la configuration

#### Technical Notes
- Utiliser `@t3-oss/env-nextjs` pour validation type-safe
- Ne jamais commiter `.env.local` ou `.env`
- Préparer les variables pour Azure (AZURE_*)

---

### Story 1.9: Page d'accueil placeholder

**Epic:** Foundation  
**Priority:** P0  
**Effort:** XS  

#### Description
As a **user**, I want to see a placeholder landing page so that I know the application is running correctly.

#### Acceptance Criteria
- [ ] Route `/` affiche une page avec le nom de l'application (EstimPro)
- [ ] Logo placeholder présent
- [ ] Message "Application en construction" ou similaire
- [ ] Lien vers la page de login (même si non fonctionnelle)
- [ ] Page responsive (mobile + desktop)
- [ ] Styles Tailwind appliqués correctement

#### Technical Notes
- Utiliser les composants shadcn/ui (Card, Button)
- Préparer le layout de base avec header/footer
- Image placeholder pour le logo

---

### Story 1.10: Configuration GitHub Actions CI

**Epic:** Foundation  
**Priority:** P1  
**Effort:** S  

#### Description
As a **developer**, I want a CI pipeline so that code quality is verified on every push.

#### Acceptance Criteria
- [ ] Fichier `.github/workflows/ci.yml` créé
- [ ] Pipeline déclenché sur push et PR vers main
- [ ] Jobs: lint, type-check, build
- [ ] Cache npm pour accélérer les builds
- [ ] Status checks visibles sur les PRs
- [ ] Build Docker testé (sans push)

#### Technical Notes
- Utiliser `ubuntu-latest` runner
- Node 22 setup
- Ajouter job de test quand les tests seront écrits
- Préparer le workflow de deploy (séparé)

---

## Résumé

| Story | Titre | Effort | Priority |
|-------|-------|--------|----------|
| 1.1 | Initialisation Next.js 16 | S | P0 |
| 1.2 | Configuration Tailwind CSS 4 | XS | P0 |
| 1.3 | Installation shadcn/ui | S | P0 |
| 1.4 | Setup Prisma | M | P0 |
| 1.5 | Structure de dossiers | S | P0 |
| 1.6 | ESLint et Prettier | XS | P0 |
| 1.7 | Dockerfile et docker-compose | M | P0 |
| 1.8 | Variables d'environnement | XS | P0 |
| 1.9 | Page d'accueil placeholder | XS | P0 |
| 1.10 | GitHub Actions CI | S | P1 |

**Total Stories:** 10  
**Effort estimé:** ~5-7 jours  

---

*Document créé par John (PM) — BMAD Method*
