# EPIC-001: Foundation

## Description

Mise en place de l'infrastructure de base du projet EstimPro : configuration Next.js 16 avec App Router, Tailwind CSS, shadcn/ui, structure de dossiers, configuration Docker, et page d'accueil initiale. Cet Epic établit les fondations sur lesquelles tous les autres Epics seront construits.

## Acceptance Criteria

- [ ] Projet Next.js 16 fonctionnel avec App Router
- [ ] Tailwind CSS configuré avec thème personnalisé
- [ ] shadcn/ui installé avec composants de base
- [ ] Structure de dossiers conforme à l'architecture
- [ ] Dockerfile multi-stage fonctionnel
- [ ] docker-compose.yml pour dev local (app + PostgreSQL)
- [ ] Variables d'environnement configurées (.env.example)
- [ ] ESLint + Prettier configurés
- [ ] Page d'accueil s'affiche correctement
- [ ] Application démarre sans erreur en dev et en container

## Dependencies

- Aucune (premier Epic)

## Technical Notes

- Next.js 16 avec App Router (pas Pages Router)
- PostgreSQL 15+ avec Prisma ORM
- shadcn/ui comme système de composants
- TanStack Query pour le data fetching (config de base)

---

## Stories

### Story 1: Initialiser le projet Next.js

- **ID:** EPIC-001-S01
- **Estimate:** S
- **Description:** Créer le projet Next.js 16 avec TypeScript, App Router, et configuration de base.
- **Acceptance Criteria:**
  - [ ] `npx create-next-app@latest` avec TypeScript et App Router
  - [ ] Suppression du contenu par défaut
  - [ ] Vérification que `npm run dev` fonctionne
  - [ ] Configuration tsconfig.json avec paths aliases (@/)

### Story 2: Configurer Tailwind CSS

- **ID:** EPIC-001-S02
- **Estimate:** S
- **Description:** Installer et configurer Tailwind CSS avec un thème personnalisé pour EstimPro.
- **Acceptance Criteria:**
  - [ ] Tailwind CSS installé et fonctionnel
  - [ ] Fichier globals.css avec reset et variables CSS
  - [ ] Thème couleurs: primary (bleu pro), secondary, accent
  - [ ] Fonts: Inter ou système

### Story 3: Installer shadcn/ui

- **ID:** EPIC-001-S03
- **Estimate:** S
- **Description:** Configurer shadcn/ui et installer les composants de base nécessaires.
- **Acceptance Criteria:**
  - [ ] shadcn/ui initialisé (`npx shadcn@latest init`)
  - [ ] Composants installés: Button, Input, Card, Table, Dialog, Form, Toast
  - [ ] Vérification que les composants s'affichent correctement

### Story 4: Structure de dossiers

- **ID:** EPIC-001-S04
- **Estimate:** S
- **Description:** Créer la structure de dossiers conforme à l'architecture définie.
- **Acceptance Criteria:**
  - [ ] `src/app/` — pages et routes
  - [ ] `src/components/` — composants réutilisables (ui/, forms/, layout/)
  - [ ] `src/lib/` — utilitaires, prisma client, helpers
  - [ ] `src/hooks/` — custom hooks
  - [ ] `src/types/` — types TypeScript partagés
  - [ ] `prisma/` — schema et migrations

### Story 5: Configuration Prisma

- **ID:** EPIC-001-S05
- **Estimate:** M
- **Description:** Installer Prisma, créer le schema initial avec les modèles de base, configurer la connexion PostgreSQL.
- **Acceptance Criteria:**
  - [ ] Prisma installé (`prisma` et `@prisma/client`)
  - [ ] Schema Prisma avec modèles: Tenant, User (minimum)
  - [ ] Configuration DATABASE_URL
  - [ ] Script `prisma generate` fonctionne
  - [ ] Prisma client exporté depuis `src/lib/prisma.ts`

### Story 6: Docker & docker-compose

- **ID:** EPIC-001-S06
- **Estimate:** M
- **Description:** Créer le Dockerfile multi-stage et docker-compose.yml pour l'environnement de développement local.
- **Acceptance Criteria:**
  - [ ] Dockerfile multi-stage (deps, build, runner)
  - [ ] Image finale légère (node:20-alpine)
  - [ ] docker-compose.yml avec services: app, postgres
  - [ ] Volumes pour persistance PostgreSQL
  - [ ] Healthcheck PostgreSQL
  - [ ] `docker-compose up` démarre l'application

### Story 7: Configuration ESLint & Prettier

- **ID:** EPIC-001-S07
- **Estimate:** S
- **Description:** Configurer ESLint et Prettier pour le linting et le formatage du code.
- **Acceptance Criteria:**
  - [ ] ESLint configuré avec règles Next.js et TypeScript
  - [ ] Prettier configuré (tabs, quotes, trailing comma)
  - [ ] Scripts npm: `lint`, `format`
  - [ ] Fichiers .eslintrc.js et .prettierrc

### Story 8: Variables d'environnement

- **ID:** EPIC-001-S08
- **Estimate:** S
- **Description:** Configurer les variables d'environnement avec validation.
- **Acceptance Criteria:**
  - [ ] Fichier `.env.example` avec toutes les variables requises
  - [ ] `.env.local` dans .gitignore
  - [ ] Variables: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
  - [ ] Documentation des variables dans README

### Story 9: Page d'accueil et Layout

- **ID:** EPIC-001-S09
- **Estimate:** M
- **Description:** Créer le layout principal et une page d'accueil de base avec branding EstimPro.
- **Acceptance Criteria:**
  - [ ] Layout racine avec metadata (title, description)
  - [ ] Header avec logo EstimPro (placeholder)
  - [ ] Page d'accueil avec message de bienvenue
  - [ ] Footer basique
  - [ ] Responsive (mobile-first)

### Story 10: Configuration TanStack Query

- **ID:** EPIC-001-S10
- **Estimate:** S
- **Description:** Installer et configurer TanStack Query pour le data fetching.
- **Acceptance Criteria:**
  - [ ] `@tanstack/react-query` installé
  - [ ] QueryClientProvider dans le layout
  - [ ] Configuration par défaut (staleTime, cacheTime)
  - [ ] DevTools en mode développement

---

## Estimation Summary

| Size | Count | Stories |
|------|-------|---------|
| S | 6 | S01, S02, S03, S04, S07, S08, S10 |
| M | 3 | S05, S06, S09 |
| L | 0 | — |

**Total: 10 stories**

---

*EPIC créé par John (PM) — BMAD Method*  
*Projet: EstimPro (estimateur-carrosserie)*  
*Date: 2026-02-04*
