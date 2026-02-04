#!/bin/sh
set -e

echo "🔄 Running database migrations..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "✅ Migrations complete. Starting server..."
exec node server.js
