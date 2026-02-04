#!/bin/sh
set -e

echo "🚀 Starting EstimPro server..."

# Skip migrations if running for the first time on fresh database
# The database schema is already created when there's data
if [ -n "$SKIP_MIGRATIONS" ]; then
  echo "⏭️ Skipping migrations (SKIP_MIGRATIONS is set)"
else
  echo "🔄 Running database migrations..."
  node ./node_modules/prisma/build/index.js migrate deploy || {
    echo "⚠️ Migration failed, but continuing to start server..."
    echo "   (This might be expected if the database is not yet set up)"
  }
fi

echo "✅ Starting server..."
exec node server.js
