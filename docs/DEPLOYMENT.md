# Déploiement Azure - EstimPro

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Azure Cloud                              │
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   ACR        │     │  Container   │     │  PostgreSQL  │    │
│  │  acrgesys    │────▶│  Apps        │────▶│  Flexible    │    │
│  │              │     │  estimpro    │     │  Server      │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                              │                                  │
│                              ▼                                  │
│                       ┌──────────────┐                         │
│                       │   Ingress    │                         │
│                       │   HTTPS      │                         │
│                       └──────────────┘                         │
│                              │                                  │
└──────────────────────────────│──────────────────────────────────┘
                               ▼
                          Internet
```

## Ressources Azure

| Ressource | Nom | Resource Group |
|-----------|-----|----------------|
| Container Registry | `acrgesys` | `rg-gesys-apps` |
| Container Apps Env (DEV) | `cae-gesys-dev` | `rg-gesys-apps` |
| Container Apps Env (PROD) | `cae-gesys-prod` | `rg-gesys-apps` |
| PostgreSQL Server | `srv-gesys-postgres-dev` | `rg-gesys-data` |
| Database | `estimpro` | — |

## Déploiement Initial

### 1. Provisionner l'infrastructure

```bash
# Depuis une machine avec Azure CLI
chmod +x scripts/provision-azure.sh
./scripts/provision-azure.sh
```

### 2. Créer le Service Principal

```bash
az ad sp create-for-rbac \
  --name "sp-github-estimpro" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-gesys-apps \
  --sdk-auth
```

Copier la sortie JSON complète.

### 3. Configurer les secrets GitHub

Dans le repo GitHub → Settings → Secrets and variables → Actions :

| Secret | Description |
|--------|-------------|
| `AZURE_CREDENTIALS` | JSON du Service Principal (étape 2) |
| `DATABASE_URL` | `postgresql://user:pass@srv-gesys-postgres-dev.postgres.database.azure.com:5432/estimpro?sslmode=require` |
| `AUTH_SECRET` | Générer avec `openssl rand -base64 32` |

### 4. Autoriser ACR pour Container Apps

```bash
# Activer l'identité managée sur l'environment
az containerapp env update \
  --name cae-gesys-dev \
  --resource-group rg-gesys-apps \
  --mi-system-assigned

# Donner accès à l'ACR
az role assignment create \
  --assignee $(az containerapp env show -n cae-gesys-dev -g rg-gesys-apps --query 'identity.principalId' -o tsv) \
  --role AcrPull \
  --scope $(az acr show -n acrgesys --query id -o tsv)
```

### 5. Déclencher le déploiement

```bash
git push origin main
```

Ou via l'onglet Actions → "Deploy to Azure Container Apps" → Run workflow

## Déploiement en Production

1. Aller dans GitHub Actions
2. "Deploy to Azure Container Apps"
3. "Run workflow" → Environment: `prod`

## URLs

| Environnement | URL |
|---------------|-----|
| DEV | `https://estimpro-dev.<random>.canadaeast.azurecontainerapps.io` |
| PROD | `https://estimpro-prod.<random>.canadaeast.azurecontainerapps.io` |

## Logs et Monitoring

```bash
# Voir les logs en temps réel
az containerapp logs show \
  --name estimpro-dev \
  --resource-group rg-gesys-apps \
  --follow

# Voir les métriques
az containerapp show \
  --name estimpro-dev \
  --resource-group rg-gesys-apps \
  --query "properties.latestRevisionName"
```

## Rollback

```bash
# Lister les révisions
az containerapp revision list \
  --name estimpro-dev \
  --resource-group rg-gesys-apps \
  --query "[].name" -o tsv

# Activer une révision précédente
az containerapp revision activate \
  --name estimpro-dev \
  --resource-group rg-gesys-apps \
  --revision <revision-name>
```
