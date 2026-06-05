#!/bin/bash
# Pushes all non-empty variables from .env.local to Vercel production.
# Run from the project root: pnpm vercel:sync-env

set -e

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found"
  exit 1
fi

echo "Syncing $ENV_FILE to Vercel production...\n"

while IFS= read -r line || [ -n "$line" ]; do
  # Skip comments and blank lines
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]] && continue

  # Split on first = only
  key="${line%%=*}"
  value="${line#*=}"

  # Skip if key or value is empty
  [[ -z "$key" || -z "$value" ]] && continue

  echo "Adding $key..."
  printf '%s' "$value" | pnpm dlx vercel env add "$key" production --force 2>&1
done < "$ENV_FILE"

echo "\nDone. Redeploy with: pnpm dlx vercel --prod"
