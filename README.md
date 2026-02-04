# EstimPro 🚗

Outil de gestion pour estimateurs en carrosserie automobile.

## Fonctionnalités

### v1.0.0 (MVP)
- 🔐 **Authentification** — Login sécurisé avec rôles (Admin, Estimateur)
- 👥 **Gestion Clients** — CRUD clients avec multi-véhicules
- 📝 **Devis** — Création, items, calcul taxes TPS/TVQ, export PDF
- 🏢 **Assurances** — Répertoire compagnies, réclamations, négociations
- 📊 **Dashboard** — KPIs, tendances CA, production en cours
- 📞 **Relances** — Suivi leads, notes de relance, raisons de perte

## Stack Technique

- **Frontend:** Next.js 16 + React 19 + Tailwind CSS 4
- **Backend:** API Routes Next.js + Prisma 6
- **Base de données:** SQLite (dev) / PostgreSQL (prod)
- **Auth:** NextAuth.js v5
- **Charts:** Recharts

## Démarrage rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Base de données
npx prisma generate
npx prisma db push

# Seed (optionnel)
npx prisma db seed

# Développement
npm run dev
```

## Variables d'environnement

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Déploiement Azure

### Container Apps

```bash
# Build Docker
docker build -t estimpro:latest .

# Push vers ACR
az acr login --name <registry>
docker tag estimpro:latest <registry>.azurecr.io/estimpro:v1.0.0
docker push <registry>.azurecr.io/estimpro:v1.0.0

# Déployer
az containerapp create \
  --name estimpro \
  --resource-group <rg> \
  --environment <env> \
  --image <registry>.azurecr.io/estimpro:v1.0.0 \
  --target-port 3000 \
  --env-vars DATABASE_URL=secretref:db-url NEXTAUTH_SECRET=secretref:auth-secret
```

## Structure du projet

```
src/
├── app/                    # App Router Next.js
│   ├── (auth)/            # Pages auth (login)
│   ├── (dashboard)/       # Pages protégées
│   └── api/v1/            # API Routes
├── components/            # Composants React
│   ├── ui/               # shadcn/ui
│   ├── clients/          # Composants clients
│   ├── devis/            # Composants devis
│   ├── dashboard/        # Composants dashboard
│   └── relances/         # Composants relances
├── hooks/                 # React Query hooks
├── lib/                   # Utilitaires
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Client Prisma
│   └── validations/      # Schemas Zod
└── middleware.ts          # Auth middleware
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET/POST /api/v1/clients` | Liste/Création clients |
| `GET/PATCH/DELETE /api/v1/clients/[id]` | CRUD client |
| `GET/POST /api/v1/devis` | Liste/Création devis |
| `GET/PATCH/DELETE /api/v1/devis/[id]` | CRUD devis |
| `POST /api/v1/devis/[id]/items` | Ajouter item |
| `GET /api/v1/dashboard/stats` | Stats globales |
| `GET /api/v1/relances` | Leads à relancer |

## Licence

Propriétaire — Gesys Solutions © 2026
