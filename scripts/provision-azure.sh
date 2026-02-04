#!/bin/bash
# Script de provisionnement Azure pour EstimPro
# À exécuter une seule fois depuis une machine avec Azure CLI

set -e

# Configuration
SUBSCRIPTION="Gesys AI"
RESOURCE_GROUP="rg-gesys-apps"
LOCATION="canadaeast"
ACR_NAME="acrgesys"
CAE_DEV="cae-gesys-dev"
CAE_PROD="cae-gesys-prod"

# PostgreSQL existant
PG_RESOURCE_GROUP="rg-gesys-data"
PG_SERVER="srv-gesys-postgres-dev"
DB_NAME="estimpro"

echo "🔧 Configuration Azure pour EstimPro"
echo "======================================"

# Set subscription
echo "📌 Setting subscription to '$SUBSCRIPTION'..."
az account set --subscription "$SUBSCRIPTION"

# Create resource group for apps
echo "📦 Creating resource group '$RESOURCE_GROUP'..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none || true

# Create Azure Container Registry
echo "🐳 Creating Azure Container Registry '$ACR_NAME'..."
az acr create \
  --name "$ACR_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --sku Basic \
  --admin-enabled true \
  --output none || echo "ACR already exists"

# Create Container Apps Environment - DEV
echo "🌐 Creating Container Apps Environment '$CAE_DEV'..."
az containerapp env create \
  --name "$CAE_DEV" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none || echo "CAE DEV already exists"

# Create Container Apps Environment - PROD
echo "🌐 Creating Container Apps Environment '$CAE_PROD'..."
az containerapp env create \
  --name "$CAE_PROD" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none || echo "CAE PROD already exists"

# Create database on PostgreSQL server
echo "🗄️ Creating database '$DB_NAME' on PostgreSQL server..."
az postgres flexible-server db create \
  --resource-group "$PG_RESOURCE_GROUP" \
  --server-name "$PG_SERVER" \
  --database-name "$DB_NAME" \
  --output none || echo "Database already exists"

# Get PostgreSQL connection info
echo ""
echo "📋 Configuration Summary"
echo "========================"
echo ""
echo "ACR Login Server: $ACR_NAME.azurecr.io"
echo ""
echo "Container Apps Environments:"
echo "  - DEV:  $CAE_DEV"
echo "  - PROD: $CAE_PROD"
echo ""
echo "PostgreSQL Server: $PG_SERVER.postgres.database.azure.com"
echo "Database: $DB_NAME"
echo ""
echo "⚠️  NEXT STEPS:"
echo ""
echo "1. Create a Service Principal for GitHub Actions:"
echo "   az ad sp create-for-rbac --name 'sp-github-estimpro' \\"
echo "     --role contributor \\"
echo "     --scopes /subscriptions/\$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP \\"
echo "     --sdk-auth"
echo ""
echo "2. Add these secrets to GitHub repo:"
echo "   - AZURE_CREDENTIALS: (output of step 1)"
echo "   - DATABASE_URL: postgresql://<user>:<password>@$PG_SERVER.postgres.database.azure.com:5432/$DB_NAME?sslmode=require"
echo "   - AUTH_SECRET: (generate with: openssl rand -base64 32)"
echo ""
echo "3. Grant ACR pull permission to Container Apps:"
echo "   az role assignment create \\"
echo "     --assignee \$(az containerapp env show -n $CAE_DEV -g $RESOURCE_GROUP --query 'identity.principalId' -o tsv) \\"
echo "     --role AcrPull \\"
echo "     --scope \$(az acr show -n $ACR_NAME --query id -o tsv)"
echo ""
echo "✅ Infrastructure provisioning complete!"
