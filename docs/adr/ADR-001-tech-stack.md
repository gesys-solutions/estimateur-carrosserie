# ADR-001: Choix de la Stack Technique

**Statut:** Accepted  
**Date:** 2026-02-04  
**Décideurs:** Winston (Architect), Yves (Product Owner)  

---

## Contexte

EstimPro est une application SaaS multi-tenant pour les ateliers de carrosserie automobile. Le projet a des contraintes techniques claires définies par le Product Owner :

- **Framework:** Next.js + Tailwind CSS
- **Base de données:** PostgreSQL (production), SQLite acceptable pour dev local
- **Authentification:** NextAuth.js
- **Déploiement:** Azure Container Apps
- **Conteneurisation:** Docker requis

L'équipe doit choisir les technologies complémentaires (ORM, state management, composants UI, etc.) en respectant ces contraintes.

---

## Options considérées

### A. ORM / Data Access

#### Option 1: Prisma
- ✅ Type-safe avec génération TypeScript automatique
- ✅ Multi-provider : même schéma pour SQLite et PostgreSQL
- ✅ Migrations déclaratives
- ✅ Excellente DX et documentation
- ❌ Overhead de génération du client
- ❌ N+1 queries possibles si mal utilisé

#### Option 2: Drizzle ORM
- ✅ Plus léger, proche du SQL
- ✅ Performance brute supérieure
- ❌ Moins mature que Prisma
- ❌ Multi-provider moins transparent

#### Option 3: TypeORM
- ✅ Mature, patterns familiers
- ❌ Configuration verbose
- ❌ Types moins stricts

**Décision : Prisma**

Raison : La compatibilité SQLite/PostgreSQL transparente est critique pour le workflow dev local → Azure. La génération de types élimine une classe entière de bugs.

---

### B. Composants UI

#### Option 1: shadcn/ui
- ✅ Composants copiés, pas de dépendance npm
- ✅ Basé sur Radix UI (accessible)
- ✅ Customisable à 100%
- ✅ Tailwind-native
- ❌ Pas de thème "out of the box"

#### Option 2: Material UI (MUI)
- ✅ Complet, design system mature
- ❌ Bundle size important
- ❌ Styling différent de Tailwind

#### Option 3: Ant Design
- ✅ Complet, bon pour admin
- ❌ Style très "enterprise"
- ❌ Moins flexible

**Décision : shadcn/ui**

Raison : Parfaite intégration avec Tailwind (contrainte projet), composants accessibles via Radix, et liberté totale de customisation. L'absence de dépendance externe facilite la maintenance.

---

### C. State Management

#### Option 1: TanStack Query (React Query)
- ✅ Cache intelligent pour les données serveur
- ✅ Optimistic updates natifs
- ✅ Refetch automatique
- ✅ Excellente intégration avec les API REST
- ❌ Pas pour le state UI local

#### Option 2: Zustand
- ✅ Simple et léger
- ✅ Bon pour state global UI
- ❌ Pas de cache serveur intégré

#### Option 3: Redux Toolkit
- ✅ Très complet
- ❌ Boilerplate important
- ❌ Overkill pour ce projet

**Décision : TanStack Query + React Context**

Raison : TanStack Query pour tout le state serveur (clients, devis, dashboard), React Context pour le state UI minimal (theme, sidebar). Évite la complexité de Redux.

---

### D. Forms & Validation

#### Option 1: React Hook Form + Zod
- ✅ Performance (uncontrolled by default)
- ✅ Validation type-safe avec Zod
- ✅ Intégration shadcn/ui native
- ❌ Courbe d'apprentissage

#### Option 2: Formik + Yup
- ✅ Mature et documenté
- ❌ Re-renders plus fréquents
- ❌ Yup moins type-safe

**Décision : React Hook Form + Zod**

Raison : Performance optimale pour les formulaires complexes (devis avec plusieurs items), et les schémas Zod peuvent être réutilisés côté API pour la validation.

---

### E. PDF Generation

#### Option 1: @react-pdf/renderer
- ✅ Composants React pour PDF
- ✅ Rendu côté serveur
- ✅ Flexible et customisable
- ❌ API légèrement différente de HTML

#### Option 2: Puppeteer/Playwright
- ✅ HTML → PDF exact
- ❌ Lourd (headless browser)
- ❌ Complexe à containeriser

#### Option 3: jsPDF
- ✅ Léger
- ❌ API bas niveau, verbeux

**Décision : @react-pdf/renderer**

Raison : Approche React cohérente avec le reste de l'app, fonctionne en API Routes sans headless browser, rendu prévisible.

---

### F. Signature Électronique

#### Option 1: react-signature-canvas
- ✅ Simple, canvas HTML5
- ✅ Export image (PNG/JPEG)
- ✅ Léger
- ❌ Pas de valeur légale intrinsèque

#### Option 2: DocuSign/HelloSign SDK
- ✅ Valeur légale établie
- ❌ Coût par signature
- ❌ Dépendance externe

**Décision : react-signature-canvas (MVP)**

Raison : Pour le MVP, une signature sur canvas avec timestamp et metadata suffit pour le workflow atelier. Évaluer DocuSign pour v1.1 si exigences légales plus strictes.

---

### G. Stockage Fichiers

#### Option 1: Azure Blob Storage
- ✅ Intégration native Azure
- ✅ CDN inclus
- ✅ Coût faible
- ❌ Lock-in Azure

#### Option 2: AWS S3
- ✅ Standard industrie
- ❌ Mix Azure + AWS complique l'infra

#### Option 3: Cloudflare R2
- ✅ Moins cher, compatible S3
- ❌ Moins mature

**Décision : Azure Blob Storage**

Raison : Cohérence avec la plateforme Azure (contrainte projet), intégration native avec Container Apps, CDN automatique.

---

## Décision Finale : Stack Complète

| Composant | Choix | Version |
|-----------|-------|---------|
| Runtime | Node.js | 22 LTS |
| Framework | Next.js | 16 (App Router) |
| UI | React | 19 |
| Styling | Tailwind CSS | 4 |
| Components | shadcn/ui | latest |
| Auth | NextAuth.js | 5 |
| ORM | Prisma | 6 |
| DB (prod) | PostgreSQL | 16 |
| DB (dev) | SQLite | 3 |
| State | TanStack Query | 5 |
| Forms | React Hook Form + Zod | latest |
| PDF | @react-pdf/renderer | latest |
| Signature | react-signature-canvas | latest |
| Storage | Azure Blob Storage | - |
| Container | Docker | latest |
| CI/CD | GitHub Actions | - |
| Hosting | Azure Container Apps | - |
| Monitoring | Azure Application Insights | - |

---

## Conséquences

### Positives

1. **Cohérence** : Stack 100% JavaScript/TypeScript, moins de context switching
2. **DX** : Types end-to-end grâce à Prisma + Zod
3. **Performance** : RSC + edge caching possible
4. **Portabilité** : Dev local identique à prod (même container)
5. **Coût** : Stack open-source, Azure pay-as-you-go

### Négatives

1. **Prisma learning curve** : L'équipe doit maîtriser les relations et migrations
2. **Next.js 16 bleeding edge** : Moins de ressources communautaires (nouveau)
3. **Azure lock-in** : Migration vers autre cloud non triviale

### Risques identifiés

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Performance Prisma | Faible | Monitoring, indexes, connection pooling |
| Breaking changes Next.js 16 | Moyenne | Épingler versions, tests CI |
| Signature légale insuffisante | Moyenne | Documenter limites, prévoir upgrade |

---

## Références

- [Next.js 16 Release Notes](https://nextjs.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/)

---

*ADR créé par Winston (System Architect) — BMAD Method*  
*Projet: EstimPro (estimateur-carrosserie)*  
*Date: 2026-02-04*
