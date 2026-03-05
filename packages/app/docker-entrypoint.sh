#!/bin/sh
set -e

# Auto-generate NUXT_AUTH_SECRET if not provided
if [ -z "$NUXT_AUTH_SECRET" ]; then
  NUXT_AUTH_SECRET=$(head -c 48 /dev/urandom | base64 | tr -d '\n')
  export NUXT_AUTH_SECRET
  echo "[ForgeCrawl] Auth secret auto-generated for this container."
  echo "[ForgeCrawl] Set NUXT_AUTH_SECRET in your environment to persist across restarts."
fi

exec "$@"
