#!/bin/bash

# Supabase Migration Script
# This script pushes the local migrations to the remote Supabase database

echo "Applying migrations to Supabase..."

# Read database URL from .env.local
DB_PASSWORD="Yc*qax57h?*eVDz"
PROJECT_REF="tgtifzajkpfqpnwbjqds"
DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"

# Execute the migration
npx supabase db push --db-url "${DATABASE_URL}"

echo "Migration complete!"
