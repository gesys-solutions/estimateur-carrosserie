# EstimPro - Gestion de Devis Carrosserie

Solution SaaS multi-tenant pour les ateliers de carrosserie automobile. Gestion des devis, clients, véhicules, négociations avec les assureurs, et tableau de bord de performance.

## 🚀 Stack Technique

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 4 + shadcn/ui
- **Base de données:** Prisma 6 (SQLite dev / PostgreSQL prod)
- **Authentification:** NextAuth.js (à implémenter)
- **Déploiement:** Docker + Azure Container Apps

## 📁 Structure du Projet

```
src/
├── app/                    # App Router (pages)
│   ├── (auth)/            # Routes authentification
│   ├── (dashboard)/       # Routes dashboard protégées
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Composants shadcn/ui
│   ├── layout/            # Header, Sidebar, Footer
│   └── shared/            # Composants réutilisables
├── lib/                   # Utilitaires et configurations
│   ├── prisma.ts          # Client Prisma singleton
│   └── utils.ts           # Helpers (cn, formatters)
├── hooks/                 # Custom React hooks
└── types/                 # Types TypeScript partagés

prisma/
├── schema.prisma          # Schéma de base de données
├── migrations/            # Migrations SQL
└── seed.ts               # Script de données de test
```

## 🛠️ Installation

### Prérequis

- Node.js 22 LTS
- npm 10+
- Docker (optionnel, pour PostgreSQL)

### Setup local

```bash
# Cloner le repo
git clone https://github.com/your-org/estimateur-carrosserie.git
cd estimateur-carrosserie

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Générer le client Prisma et appliquer les migrations
npm run db:generate
npm run db:migrate

# (Optionnel) Seed avec données de test
npm run db:seed

# Lancer en développement
npm run dev
```

L'application sera accessible sur http://localhost:3000

## 📜 Scripts npm

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le serveur de production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run lint:fix` | Corrige les erreurs ESLint |
| `npm run format` | Formate le code avec Prettier |
| `npm run typecheck` | Vérifie les types TypeScript |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:push` | Push le schéma (dev) |
| `npm run db:studio` | Ouvre Prisma Studio |
| `npm run db:seed` | Seed la base de données |

## 🔐 Variables d'Environnement

Créez un fichier `.env.local` à la racine :

```env
# Database (SQLite pour dev, PostgreSQL pour prod)
DATABASE_URL="file:./dev.db"
# DATABASE_URL="postgresql://user:password@localhost:5432/estimpro"

# NextAuth.js
NEXTAUTH_SECRET="votre-secret-32-caracteres-min"
NEXTAUTH_URL="http://localhost:3000"

# (Production) Azure Blob Storage
# AZURE_STORAGE_CONNECTION_STRING=""
# AZURE_STORAGE_CONTAINER_NAME="estimpro"
```

## 🐳 Docker

### Build de l'image

```bash
docker build -t estimpro .
```

### Docker Compose (dev complet)

```bash
docker compose up
```

Cela démarre :
- L'application Next.js sur le port 3000
- PostgreSQL sur le port 5432
- Adminer (gestion DB) sur le port 8080

## 🏗️ Architecture

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour l'architecture complète du système.

### Entités principales

- **Tenant** - Atelier de carrosserie (multi-tenant)
- **User** - Utilisateurs (Admin, Manager, Estimator)
- **Client** - Clients de l'atelier
- **Vehicle** - Véhicules des clients
- **Estimate** - Devis de réparation
- **LineItem** - Lignes de devis (pièces, main d'œuvre, peinture)
- **Insurer** - Compagnies d'assurance
- **Claim** - Réclamations assurance
- **Negotiation** - Historique des négociations
- **Signature** - Signatures électroniques
- **AuditLog** - Journal d'audit

## 🔄 Workflow des Devis

```
DRAFT → SUBMITTED → NEGOTIATION → APPROVED → SIGNED → IN_REPAIR → READY → DELIVERED → CLOSED
                                                                              ↓
                                                                            LOST
```

## 📊 Fonctionnalités

- [x] Structure de base Next.js 16
- [x] Configuration Tailwind CSS 4
- [x] Composants shadcn/ui
- [x] Schéma Prisma complet
- [x] Page d'accueil
- [x] Layout dashboard
- [x] Dockerfile multi-stage
- [x] Docker Compose
- [x] CI GitHub Actions
- [ ] Authentification NextAuth.js
- [ ] CRUD Clients
- [ ] CRUD Devis
- [ ] Génération PDF
- [ ] Signatures électroniques
- [ ] Dashboard analytics

## 📝 Licence

Propriétaire — © 2026 Gesys Solutions

---

*Projet développé avec la méthodologie [BMAD](https://github.com/bmad-code-org/BMAD-METHOD)*
