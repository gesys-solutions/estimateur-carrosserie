# Architecture: EstimPro

**Date:** 2026-02-04  
**Auteur:** Winston (System Architect — BMAD)  
**Version:** 1.0  
**Statut:** Approved  

---

## 1. Vue d'ensemble

EstimPro est une application web SaaS multi-tenant destinée aux ateliers de carrosserie automobile québécois/canadiens. L'architecture suit un pattern moderne "full-stack" avec Next.js 16 (App Router) pour le frontend et l'API, PostgreSQL pour la persistance, et un déploiement conteneurisé sur Azure Container Apps.

L'application centralise le workflow complet de l'estimateur : gestion clients, création de devis, négociations assurances, signatures électroniques, et dashboard de performance.

---

## 2. Diagramme d'architecture

```
                                    ┌─────────────────────────────────────────┐
                                    │            AZURE CLOUD                  │
                                    │                                         │
┌──────────────┐                    │  ┌─────────────────────────────────┐    │
│   Browser    │◄───HTTPS/TLS───────┼──┤     Azure Container Apps        │    │
│  (Chrome,    │                    │  │                                 │    │
│   Firefox,   │                    │  │  ┌───────────────────────────┐  │    │
│   Safari)    │                    │  │  │     Docker Container      │  │    │
└──────────────┘                    │  │  │                           │  │    │
                                    │  │  │  ┌─────────────────────┐  │  │    │
┌──────────────┐                    │  │  │  │    Next.js 16       │  │  │    │
│   Mobile     │◄───HTTPS/TLS───────┼──┤  │  │    (App Router)     │  │  │    │
│  (Responsive)│                    │  │  │  │                     │  │  │    │
└──────────────┘                    │  │  │  │  ┌───────────────┐  │  │  │    │
                                    │  │  │  │  │ React Server  │  │  │  │    │
                                    │  │  │  │  │ Components    │  │  │  │    │
                                    │  │  │  │  └───────────────┘  │  │  │    │
                                    │  │  │  │                     │  │  │    │
                                    │  │  │  │  ┌───────────────┐  │  │  │    │
                                    │  │  │  │  │ API Routes    │  │  │  │    │
                                    │  │  │  │  │ (/api/*)      │  │  │  │    │
                                    │  │  │  │  └───────────────┘  │  │  │    │
                                    │  │  │  │                     │  │  │    │
                                    │  │  │  │  ┌───────────────┐  │  │  │    │
                                    │  │  │  │  │ NextAuth.js   │  │  │  │    │
                                    │  │  │  │  └───────────────┘  │  │  │    │
                                    │  │  │  └─────────────────────┘  │  │    │
                                    │  │  └───────────────────────────┘  │    │
                                    │  └─────────────────┬───────────────┘    │
                                    │                    │                    │
                                    │                    │ Prisma ORM         │
                                    │                    │                    │
                                    │  ┌─────────────────▼───────────────┐    │
                                    │  │    Azure Database for           │    │
                                    │  │    PostgreSQL (Flexible)        │    │
                                    │  │                                 │    │
                                    │  │  ┌───────────────────────────┐  │    │
                                    │  │  │  Multi-tenant Schema      │  │    │
                                    │  │  │  (tenant_id isolation)    │  │    │
                                    │  │  └───────────────────────────┘  │    │
                                    │  └─────────────────────────────────┘    │
                                    │                                         │
                                    │  ┌─────────────────────────────────┐    │
                                    │  │    Azure Blob Storage           │    │
                                    │  │    (Photos, PDFs, Signatures)   │    │
                                    │  └─────────────────────────────────┘    │
                                    │                                         │
                                    └─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEV LOCAL (VM)                                     │
│                                                                             │
│  ┌───────────────────────┐    ┌───────────────────────┐                     │
│  │   Docker Container    │    │   SQLite (dev)        │                     │
│  │   (same image)        │◄───┤   ou PostgreSQL       │                     │
│  │                       │    │   (docker-compose)    │                     │
│  └───────────────────────┘    └───────────────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack technique

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Runtime** | Node.js | 22 LTS | Performance, support ESM natif, long-term support |
| **Framework** | Next.js | 16 | App Router, RSC, API Routes, SSR/SSG, contrainte projet |
| **UI** | React | 19 | Concurrent features, Server Components |
| **Styling** | Tailwind CSS | 4 | Utility-first, design system rapide, contrainte projet |
| **Components** | shadcn/ui | latest | Composants accessibles, customisables, pas de lock-in |
| **Auth** | NextAuth.js | 5 | Contrainte projet, sessions DB, RBAC natif |
| **ORM** | Prisma | 6 | Type-safe, migrations, multi-provider (SQLite/PostgreSQL) |
| **DB (prod)** | PostgreSQL | 16 | Relationnel, JSONB, contrainte projet |
| **DB (dev)** | SQLite | 3 | Léger, zero-config, migrations Prisma compatibles |
| **PDF** | @react-pdf/renderer | latest | PDF côté serveur, composants React |
| **Signature** | react-signature-canvas | latest | Canvas signature simple, export image |
| **State** | TanStack Query | 5 | Cache, mutations, optimistic updates |
| **Forms** | React Hook Form + Zod | latest | Validation type-safe, performance |
| **Container** | Docker | latest | Portabilité, contrainte projet |
| **Hosting** | Azure Container Apps | - | Contrainte projet, auto-scaling, managed |
| **CI/CD** | GitHub Actions | - | Intégration native GitHub |
| **Monitoring** | Azure Application Insights | - | APM, logs, alertes intégrées Azure |

### Justification des choix clés (voir ADR-001)

- **Next.js 16 + App Router** : RSC pour performance, API Routes évitent un backend séparé
- **Prisma multi-provider** : Même schéma pour SQLite (dev) et PostgreSQL (prod)
- **shadcn/ui** : Composants copiés, pas de dépendance, facile à customiser
- **NextAuth.js** : Intégration native Next.js, sessions en DB pour multi-tenant

---

## 4. Database Schema

### 4.1 Vue d'ensemble des entités

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Tenant    │────<│    User     │     │  Insurer    │
│   (Atelier) │     │ (Estimator) │     │ (Assureur)  │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                          │                    │
                          │ creates            │ linked
                          ▼                    │
┌─────────────┐     ┌─────────────┐     ┌──────▼──────┐
│   Client    │────<│  Estimate   │────<│   Claim     │
│             │     │   (Devis)   │     │ (Réclamation│
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │ owns              │ contains
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│   Vehicle   │     │ LineItem    │
│  (Véhicule) │     │ (Item devis)│
└─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Negotiation │     │  Signature  │     │  AuditLog   │
│   (Négo)    │     │ (Signature) │     │   (Audit)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 4.2 Schéma détaillé (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // ou "sqlite" pour dev
  url      = env("DATABASE_URL")
}

// ============================================
// MULTI-TENANT
// ============================================

model Tenant {
  id        String   @id @default(cuid())
  name      String   // Nom de l'atelier
  slug      String   @unique // URL-friendly identifier
  address   String?
  phone     String?
  email     String?
  logoUrl   String?
  taxConfig Json     @default("{}") // {"tps": 5, "tvq": 9.975}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users     User[]
  clients   Client[]
  estimates Estimate[]
  insurers  Insurer[]
  auditLogs AuditLog[]

  @@index([slug])
}

// ============================================
// AUTH & USERS
// ============================================

enum Role {
  ADMIN
  MANAGER
  ESTIMATOR
}

model User {
  id            String    @id @default(cuid())
  tenantId      String
  tenant        Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  email         String
  passwordHash  String
  firstName     String
  lastName      String
  role          Role      @default(ESTIMATOR)
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  estimates     Estimate[]
  negotiations  Negotiation[]
  auditLogs     AuditLog[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([email])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())

  @@index([userId])
}

// ============================================
// CLIENTS & VEHICLES
// ============================================

model Client {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  firstName String
  lastName  String
  phone     String?
  email     String?
  address   String?
  city      String?
  postalCode String?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  vehicles  Vehicle[]
  estimates Estimate[]

  @@index([tenantId])
  @@index([tenantId, lastName])
  @@index([tenantId, phone])
}

model Vehicle {
  id           String   @id @default(cuid())
  clientId     String
  client       Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  make         String   // Marque
  model        String   // Modèle
  year         Int
  vin          String?  // VIN
  plate        String?  // Immatriculation
  color        String?
  mileage      Int?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  estimates    Estimate[]

  @@index([clientId])
  @@index([plate])
  @@index([vin])
}

// ============================================
// ESTIMATES & LINE ITEMS
// ============================================

enum EstimateStatus {
  DRAFT        // En cours de création
  SUBMITTED    // Envoyé à l'assureur
  NEGOTIATION  // Contre-offre reçue
  APPROVED     // Prix convenu accepté
  SIGNED       // Autorisations signées
  IN_REPAIR    // Véhicule en atelier
  READY        // Réparation terminée
  DELIVERED    // Véhicule livré
  CLOSED       // Dossier archivé
  LOST         // Devis non converti
}

enum LineItemType {
  LABOR        // Main d'œuvre
  PART         // Pièce
  PAINT        // Peinture
  MISC         // Divers
}

model Estimate {
  id             String         @id @default(cuid())
  tenantId       String
  tenant         Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  number         String         // Numéro de devis (séquentiel par tenant)
  clientId       String
  client         Client         @relation(fields: [clientId], references: [id])
  vehicleId      String
  vehicle        Vehicle        @relation(fields: [vehicleId], references: [id])
  createdById    String
  createdBy      User           @relation(fields: [createdById], references: [id])
  status         EstimateStatus @default(DRAFT)
  damageType     String?        // Type de dommage (collision, vandalisme, etc.)
  description    String?        // Description des dommages
  subtotal       Decimal        @default(0) @db.Decimal(10, 2)
  taxTps         Decimal        @default(0) @db.Decimal(10, 2)
  taxTvq         Decimal        @default(0) @db.Decimal(10, 2)
  total          Decimal        @default(0) @db.Decimal(10, 2)
  agreedPrice    Decimal?       @db.Decimal(10, 2) // Prix convenu (locked)
  agreedAt       DateTime?      // Date accord prix
  isLocked       Boolean        @default(false) // Verrouillé après approved
  timeSpentMin   Int            @default(0) // Temps passé en minutes
  lossReason     String?        // Raison de perte si LOST
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  lineItems      LineItem[]
  claim          Claim?
  negotiations   Negotiation[]
  signatures     Signature[]

  @@unique([tenantId, number])
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, createdById])
  @@index([clientId])
  @@index([vehicleId])
  @@index([createdAt])
}

model LineItem {
  id          String       @id @default(cuid())
  estimateId  String
  estimate    Estimate     @relation(fields: [estimateId], references: [id], onDelete: Cascade)
  type        LineItemType
  description String
  quantity    Decimal      @db.Decimal(10, 2)
  unitPrice   Decimal      @db.Decimal(10, 2)
  subtotal    Decimal      @db.Decimal(10, 2) // quantity * unitPrice
  sortOrder   Int          @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([estimateId])
}

// ============================================
// INSURANCE & CLAIMS
// ============================================

model Insurer {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name      String
  code      String?  // Code court (ex: INT pour Intact)
  phone     String?
  email     String?
  address   String?
  notes     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  claims    Claim[]

  @@unique([tenantId, name])
  @@index([tenantId])
}

model Claim {
  id            String   @id @default(cuid())
  estimateId    String   @unique
  estimate      Estimate @relation(fields: [estimateId], references: [id], onDelete: Cascade)
  insurerId     String
  insurer       Insurer  @relation(fields: [insurerId], references: [id])
  claimNumber   String   // Numéro de réclamation
  adjusterName  String?  // Nom de l'expert
  adjusterPhone String?
  adjusterEmail String?
  deductible    Decimal? @db.Decimal(10, 2) // Franchise
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([insurerId])
  @@index([claimNumber])
}

model Negotiation {
  id          String   @id @default(cuid())
  estimateId  String
  estimate    Estimate @relation(fields: [estimateId], references: [id], onDelete: Cascade)
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
  notes       String   // Notes de négociation
  amount      Decimal? @db.Decimal(10, 2) // Montant proposé/contre-proposé
  createdAt   DateTime @default(now())

  @@index([estimateId])
  @@index([createdAt])
}

// ============================================
// SIGNATURES
// ============================================

enum SignatureType {
  AUTHORIZATION  // Autorisation de réparation
  DELIVERY       // Signature livraison
  ESTIMATE       // Acceptation devis
}

model Signature {
  id          String        @id @default(cuid())
  estimateId  String
  estimate    Estimate      @relation(fields: [estimateId], references: [id], onDelete: Cascade)
  type        SignatureType
  signerName  String        // Nom du signataire
  imageUrl    String        // URL image signature (Blob Storage)
  signedAt    DateTime      @default(now())

  @@index([estimateId])
  @@index([type])
}

// ============================================
// AUDIT LOG
// ============================================

model AuditLog {
  id         String   @id @default(cuid())
  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  action     String   // CREATE, UPDATE, DELETE, LOGIN, STATUS_CHANGE, etc.
  entityType String   // Estimate, Client, etc.
  entityId   String?
  details    Json?    // Détails supplémentaires
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@index([tenantId])
  @@index([tenantId, action])
  @@index([tenantId, entityType, entityId])
  @@index([createdAt])
}
```

### 4.3 Index clés pour la performance

| Table | Index | Raison |
|-------|-------|--------|
| `Estimate` | `[tenantId, status]` | Dashboard filtré par statut |
| `Estimate` | `[tenantId, createdById]` | "Mes devis" pour estimateur |
| `Estimate` | `[createdAt]` | Tri chronologique, rapports |
| `Client` | `[tenantId, lastName]` | Recherche par nom |
| `Client` | `[tenantId, phone]` | Recherche par téléphone |
| `Vehicle` | `[plate]` | Recherche par immatriculation |
| `AuditLog` | `[tenantId, createdAt]` | Historique d'audit |

---

## 5. API Design

### 5.1 Conventions

- **Base path** : `/api/v1/`
- **Format** : JSON
- **Auth** : Bearer token (JWT via NextAuth)
- **Tenant isolation** : Automatique via middleware (extrait du token)
- **Pagination** : `?page=1&limit=20` pour les listes
- **Filtering** : `?status=DRAFT&createdById=xxx`
- **Sorting** : `?sort=createdAt&order=desc`

### 5.2 Endpoints

#### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signin` | Login (NextAuth) |
| POST | `/api/auth/signout` | Logout |
| GET | `/api/auth/session` | Session courante |

#### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/clients` | Liste des clients (paginated) |
| GET | `/api/v1/clients/search?q=` | Recherche clients |
| POST | `/api/v1/clients` | Créer un client |
| GET | `/api/v1/clients/:id` | Détail client avec véhicules |
| PUT | `/api/v1/clients/:id` | Modifier un client |
| DELETE | `/api/v1/clients/:id` | Supprimer (soft delete) |

#### Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/clients/:clientId/vehicles` | Véhicules du client |
| POST | `/api/v1/clients/:clientId/vehicles` | Ajouter véhicule |
| PUT | `/api/v1/vehicles/:id` | Modifier véhicule |
| DELETE | `/api/v1/vehicles/:id` | Supprimer |

#### Estimates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/estimates` | Liste des devis (paginated, filterable) |
| POST | `/api/v1/estimates` | Créer un devis |
| GET | `/api/v1/estimates/:id` | Détail devis complet |
| PUT | `/api/v1/estimates/:id` | Modifier le devis |
| PATCH | `/api/v1/estimates/:id/status` | Changer le statut |
| POST | `/api/v1/estimates/:id/lock` | Verrouiller (après approved) |
| GET | `/api/v1/estimates/:id/pdf` | Générer et télécharger PDF |

#### Line Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/estimates/:id/items` | Ajouter un item |
| PUT | `/api/v1/items/:id` | Modifier item |
| DELETE | `/api/v1/items/:id` | Supprimer item |
| PUT | `/api/v1/estimates/:id/items/reorder` | Réordonner items |

#### Claims & Insurance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/insurers` | Liste assureurs |
| POST | `/api/v1/insurers` | Créer assureur |
| PUT | `/api/v1/insurers/:id` | Modifier assureur |
| POST | `/api/v1/estimates/:id/claim` | Associer réclamation |
| PUT | `/api/v1/claims/:id` | Modifier réclamation |

#### Negotiations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/estimates/:id/negotiations` | Historique négociations |
| POST | `/api/v1/estimates/:id/negotiations` | Ajouter note de négo |

#### Signatures

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/estimates/:id/signatures` | Signatures du devis |
| POST | `/api/v1/estimates/:id/signatures` | Ajouter signature (upload image) |

#### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/today` | Ventes du jour |
| GET | `/api/v1/dashboard/stats` | KPIs globaux |
| GET | `/api/v1/dashboard/by-status` | Compteurs par statut |
| GET | `/api/v1/dashboard/by-estimator` | Stats par estimateur |

#### Users (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | Liste utilisateurs |
| POST | `/api/v1/users` | Créer utilisateur |
| PUT | `/api/v1/users/:id` | Modifier utilisateur |
| PATCH | `/api/v1/users/:id/deactivate` | Désactiver compte |

### 5.3 Exemple de réponse

```json
// GET /api/v1/estimates?status=DRAFT&page=1&limit=10

{
  "data": [
    {
      "id": "clx123...",
      "number": "EST-2026-0042",
      "client": {
        "id": "clx456...",
        "firstName": "Jean",
        "lastName": "Tremblay"
      },
      "vehicle": {
        "id": "clx789...",
        "make": "Honda",
        "model": "Civic",
        "year": 2022
      },
      "status": "DRAFT",
      "total": "2450.00",
      "createdAt": "2026-02-04T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

### 5.4 Codes d'erreur

| Code | Signification |
|------|---------------|
| 400 | Bad Request — Validation error |
| 401 | Unauthorized — Token manquant/invalide |
| 403 | Forbidden — Pas les permissions |
| 404 | Not Found — Ressource inexistante |
| 409 | Conflict — Violation de contrainte |
| 422 | Unprocessable — Règle métier violée |
| 500 | Internal Error — Bug serveur |

---

## 6. Component Architecture (Frontend)

### 6.1 Structure des dossiers

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx              # Sidebar + Header
│   ├── page.tsx                # Dashboard home
│   ├── clients/
│   │   ├── page.tsx            # Liste clients
│   │   ├── new/page.tsx        # Nouveau client
│   │   └── [id]/page.tsx       # Détail client
│   ├── estimates/
│   │   ├── page.tsx            # Liste devis
│   │   ├── new/page.tsx        # Nouveau devis
│   │   └── [id]/
│   │       ├── page.tsx        # Détail devis
│   │       └── edit/page.tsx   # Édition devis
│   ├── insurers/
│   │   └── page.tsx            # Gestion assureurs
│   ├── reports/
│   │   └── page.tsx            # Rapports
│   └── settings/
│       ├── page.tsx            # Config atelier
│       └── users/page.tsx      # Gestion utilisateurs
├── api/
│   ├── auth/[...nextauth]/route.ts
│   └── v1/
│       ├── clients/route.ts
│       ├── estimates/route.ts
│       └── ...
├── layout.tsx                  # Root layout
└── globals.css

components/
├── ui/                         # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── table.tsx
│   └── ...
├── clients/
│   ├── client-form.tsx
│   ├── client-list.tsx
│   └── client-search.tsx
├── estimates/
│   ├── estimate-form.tsx
│   ├── estimate-table.tsx
│   ├── line-item-row.tsx
│   ├── status-badge.tsx
│   └── signature-pad.tsx
├── dashboard/
│   ├── stats-card.tsx
│   ├── status-chart.tsx
│   └── recent-estimates.tsx
├── layout/
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── user-menu.tsx
└── shared/
    ├── data-table.tsx
    ├── pagination.tsx
    ├── search-input.tsx
    └── loading-spinner.tsx

lib/
├── auth.ts                     # NextAuth config
├── prisma.ts                   # Prisma client singleton
├── utils.ts                    # Helpers
└── validations/
    ├── client.ts               # Zod schemas
    ├── estimate.ts
    └── user.ts

hooks/
├── use-clients.ts              # TanStack Query hooks
├── use-estimates.ts
├── use-dashboard.ts
└── use-current-user.ts

types/
├── index.ts                    # Types partagés
└── api.ts                      # Types API responses
```

### 6.2 Composants clés

```tsx
// Exemple: components/estimates/estimate-form.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { estimateSchema } from "@/lib/validations/estimate";
import { Button } from "@/components/ui/button";
import { LineItemRow } from "./line-item-row";
import { useCreateEstimate } from "@/hooks/use-estimates";

export function EstimateForm({ clientId, vehicleId }: Props) {
  const form = useForm({
    resolver: zodResolver(estimateSchema),
    defaultValues: { clientId, vehicleId, items: [] }
  });
  
  const { mutate: createEstimate, isPending } = useCreateEstimate();
  
  return (
    <form onSubmit={form.handleSubmit(createEstimate)}>
      {/* Form fields */}
    </form>
  );
}
```

### 6.3 State Management

- **Server state** : TanStack Query (cache, refetch, optimistic updates)
- **Form state** : React Hook Form (controlled, validation)
- **UI state** : React Context pour theme/sidebar state
- **URL state** : searchParams pour filtres/pagination

---

## 7. Security Architecture

### 7.1 Authentication

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────>│ NextAuth.js │────>│   Session   │
│             │     │             │     │   (DB)      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   │ validates
       │                   ▼
       │            ┌─────────────┐
       └───────────>│    User     │
                    │   (Role)    │
                    └─────────────┘
```

- **Provider** : Credentials (email + password)
- **Session** : JWT stocké en cookie httpOnly, info stockée en DB
- **Password** : bcrypt avec salt rounds = 12
- **Token expiry** : 24h (configurable)

### 7.2 Authorization (RBAC)

| Role | Permissions |
|------|-------------|
| **ADMIN** | Tout + gestion utilisateurs + config atelier |
| **MANAGER** | Voir tous les devis + rapports + dashboard complet |
| **ESTIMATOR** | CRUD sur ses propres devis, vue limitée du dashboard |

```typescript
// lib/permissions.ts
export const permissions = {
  ADMIN: ["*"],
  MANAGER: [
    "estimates:read:all",
    "estimates:write:all", 
    "clients:*",
    "dashboard:read:all",
    "reports:*"
  ],
  ESTIMATOR: [
    "estimates:read:own",
    "estimates:write:own",
    "clients:*",
    "dashboard:read:own"
  ]
};
```

### 7.3 Multi-tenant Isolation

**Stratégie** : `tenant_id` sur toutes les tables, filtrage automatique

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request });
  if (!session?.tenantId) {
    return NextResponse.redirect("/login");
  }
  
  // Injecte tenantId dans les headers pour les API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", session.tenantId);
  
  return NextResponse.next({ headers: requestHeaders });
}
```

### 7.4 Data Protection

| Aspect | Mesure |
|--------|--------|
| **Transit** | HTTPS obligatoire (TLS 1.3), Azure gère les certs |
| **Repos** | Azure Storage encryption at rest (AES-256) |
| **Secrets** | Variables d'environnement, Azure Key Vault (prod) |
| **PII** | Données clients dans DB chiffrée, accès loggé |
| **Backup** | Azure automated backups, 30 jours rétention |

### 7.5 Audit Trail

Toutes les actions critiques sont loggées dans `AuditLog`:
- Login/logout
- Création/modification/suppression de devis
- Changements de statut
- Signatures
- Modifications de prix convenu

---

## 8. Infrastructure

### 8.1 Développement local

```yaml
# docker-compose.yml

version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./dev.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
    volumes:
      - ./prisma:/app/prisma
      - ./dev.db:/app/dev.db

  # Option: PostgreSQL local pour tests de compatibilité
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=estimator
      - POSTGRES_PASSWORD=dev_password
      - POSTGRES_DB=estimpro
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 8.2 Dockerfile

```dockerfile
# Dockerfile

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 8.3 Azure Container Apps

```yaml
# .github/workflows/deploy.yml

name: Deploy to Azure Container Apps

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to Azure
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
          
      - name: Build and push image
        run: |
          az acr login --name ${{ vars.ACR_NAME }}
          docker build -t ${{ vars.ACR_NAME }}.azurecr.io/estimpro:${{ github.sha }} .
          docker push ${{ vars.ACR_NAME }}.azurecr.io/estimpro:${{ github.sha }}
          
      - name: Deploy to Container Apps
        uses: azure/container-apps-deploy-action@v1
        with:
          containerAppName: estimpro
          resourceGroup: ${{ vars.RESOURCE_GROUP }}
          imageToDeploy: ${{ vars.ACR_NAME }}.azurecr.io/estimpro:${{ github.sha }}
```

### 8.4 Ressources Azure

| Ressource | SKU/Tier | Coût estimé/mois |
|-----------|----------|------------------|
| Container Apps | Consumption | ~$20-50 (scaling) |
| PostgreSQL Flexible | Burstable B1ms | ~$15 |
| Blob Storage | Standard LRS | ~$5 |
| Application Insights | Pay-as-you-go | ~$5 |
| **Total estimé** | | **~$45-75/mois** |

---

## 9. Performance Considerations

### 9.1 Cibles NFR

| Métrique | Cible | Comment atteindre |
|----------|-------|-------------------|
| TTFB | < 200ms | RSC, edge caching |
| LCP | < 2.5s | Image optimization, lazy loading |
| API response | < 500ms (P95) | DB indexes, query optimization |
| Concurrent users | 50+ | Horizontal scaling, connection pooling |

### 9.2 Optimisations

**Frontend:**
- React Server Components pour réduire le JS client
- Image optimization avec `next/image`
- Lazy loading des composants lourds (signature pad, PDF viewer)
- Prefetch des routes probables

**Backend:**
- Connection pooling Prisma (PgBouncer en prod)
- Indexes sur les colonnes fréquemment filtrées
- Pagination systématique (max 50 items)
- Cache TanStack Query (staleTime: 30s pour dashboard)

**Infrastructure:**
- Azure CDN pour assets statiques
- Auto-scaling Container Apps (0-10 instances)
- PostgreSQL read replicas (future, si besoin)

---

## 10. Scalability Strategy

### 10.1 Phase 1 : MVP (1-10 ateliers)

- Single container instance
- PostgreSQL Burstable
- SQLite pour dev local
- Monitoring basique

### 10.2 Phase 2 : Croissance (10-50 ateliers)

- Auto-scaling 1-5 instances
- PostgreSQL General Purpose
- Azure Blob CDN
- Alerting avancé

### 10.3 Phase 3 : Scale (50-100+ ateliers)

- Read replicas PostgreSQL
- Redis cache pour sessions/dashboard
- Multi-région (si expansion Canada)
- Queue pour tâches async (PDF generation)

### 10.4 Limites connues

| Limite | Seuil | Solution |
|--------|-------|----------|
| DB connections | 100 concurrent | PgBouncer pooling |
| PDF generation | 3s timeout | Queue + worker séparé |
| File uploads | 50MB | Chunked upload + Blob Storage |
| Search | 10k clients | Indexation Elasticsearch (future) |

---

## 11. Décisions reportées

| Décision | Pourquoi reportée | À décider quand |
|----------|-------------------|-----------------|
| **PWA/Offline** | Complexité, v1.1 | Feedback utilisateurs |
| **OCR Scan** | API tierce à évaluer | Sprint dédié |
| **Intégration comptable** | Dépendance externe | Partenariat établi |
| **Multi-atelier** | Cas avancé | >20 ateliers clients |
| **Real-time updates** | WebSockets complexe | Besoin identifié |

---

## 12. ADRs Associés

- [ADR-001: Choix de la stack technique](./adr/ADR-001-tech-stack.md)

---

## 13. Prochaines étapes

- [ ] ✅ Architecture approuvée
- [ ] Créer les Epics & Stories (John)
- [ ] Setup environnement de dev
- [ ] Initialiser le repo avec la structure
- [ ] Configurer CI/CD GitHub Actions
- [ ] Provisionner Azure (PostgreSQL, Container Apps)

---

*Document créé par Winston (System Architect) — BMAD Method*  
*Projet: EstimPro (estimateur-carrosserie)*  
*Date: 2026-02-04*
