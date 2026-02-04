# Estimateur Carrosserie

Outil de gestion pour estimateurs en carrosserie automobile — devis, suivi clients, négociations assurances, tableau de bord ventes/production.

## 🚀 Stack Technique

- **Frontend:** Next.js 16 + React 19 + Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Base de données:** PostgreSQL (via Prisma ORM)
- **Authentification:** NextAuth.js v5
- **Validation:** Zod
- **Déploiement:** Docker → Azure Container Apps

## 📋 Fonctionnalités

- ✅ **Gestion clients** — CRUD complet, véhicules associés
- ✅ **Création de devis** — Items, calcul TPS/TVQ automatique
- ✅ **Suivi assurances** — Compagnies, réclamations, prix convenus
- ✅ **Dashboard** — KPIs, ventes/production, graphiques
- ✅ **Relances** — Suivi des devis non convertis
- ✅ **Multi-tenant** — Isolation par entreprise
- ✅ **Rôles** — Admin, Manager, Estimateur

## 🛠️ Installation

### Prérequis

- Node.js 22+
- Docker & Docker Compose (pour la BDD)
- npm ou yarn

### Setup local

```bash
# Cloner le repo
git clone https://github.com/gesys-solutions/estimateur-carrosserie.git
cd estimateur-carrosserie

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env

# Démarrer PostgreSQL
docker-compose up -d db

# Appliquer les migrations
npx prisma migrate dev

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur http://localhost:3000

### Docker (production)

```bash
# Build et démarrage complets
docker-compose --profile full up --build
```

## 📁 Structure du Projet

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pages d'authentification
│   │   └── login/
│   ├── (dashboard)/       # Pages protégées
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── devis/
│   │   ├── assurances/
│   │   └── relances/
│   └── api/               # API Routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── clients/           # Client-specific components
│   ├── devis/             # Devis-specific components
│   └── dashboard/         # Dashboard components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── db/               # Prisma client
│   ├── auth/             # Auth utilities
│   └── validations/      # Zod schemas
└── types/                # TypeScript types
```

## 🗃️ Base de Données

Le schéma Prisma définit les entités suivantes :
- **Tenant** — Multi-tenant support
- **User** — Utilisateurs avec rôles
- **Client** — Clients avec véhicules
- **Vehicle** — Véhicules des clients
- **Devis** — Devis avec items
- **DevisItem** — Lignes de devis
- **Assurance** — Compagnies d'assurance
- **Reclamation** — Réclamations assurance
- **Relance** — Suivi des relances

## 🔐 Authentification

- NextAuth.js v5 avec credentials provider
- Rôles: ADMIN, MANAGER, ESTIMATEUR
- Sessions JWT

## 📊 Taxes Québec

- TPS: 5%
- TVQ: 9.975%
- Calcul automatique dans les devis

## 🚢 Déploiement

### Azure Container Apps

1. Build l'image Docker
2. Push vers Azure Container Registry
3. Déployer sur Azure Container Apps
4. Configurer les variables d'environnement

Voir `docs/DEPLOYMENT.md` pour les détails.

## 📝 Licence

Propriétaire — © 2026 Gesys Solutions. Tous droits réservés.
