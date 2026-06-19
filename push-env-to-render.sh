#!/bin/bash
# Reads Cloudinary + other env vars from backend/.env and pushes them to Render.
# Usage: export RENDER_API_KEY=rnd_xxx  then  bash push-env-to-render.sh

set -e

if [ -z "$RENDER_API_KEY" ]; then
  echo "❌  RENDER_API_KEY is not set."
  echo "    Run:  export RENDER_API_KEY=rnd_your_key_here"
  exit 1
fi

ENV_FILE="$(dirname "$0")/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌  backend/.env not found at: $ENV_FILE"
  exit 1
fi

echo "🔍  Fetching your Render services..."
SERVICES=$(curl -sf -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services?limit=20")

# Find the backend service (type=web, name contains "backend" or "agrilink")
SERVICE_ID=$(echo "$SERVICES" | grep -o '"id":"srv-[^"]*"' | head -1 | cut -d'"' -f4)
SERVICE_NAME=$(echo "$SERVICES" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SERVICE_ID" ]; then
  echo "❌  No Render service found. Check your API key."
  exit 1
fi

echo "✅  Found service: $SERVICE_NAME ($SERVICE_ID)"

# Keys to push from .env
KEYS=("CLOUDINARY_CLOUD_NAME" "CLOUDINARY_API_KEY" "CLOUDINARY_API_SECRET" "MONGO_URI" "JWT_SECRET" "JWT_EXPIRES_IN" "NODE_ENV" "CLIENT_URL")

# Build JSON env vars array
ENV_JSON="["
FIRST=true
for KEY in "${KEYS[@]}"; do
  VALUE=$(grep -E "^${KEY}=" "$ENV_FILE" | head -1 | cut -d'=' -f2-)
  # Strip surrounding quotes if any
  VALUE=$(echo "$VALUE" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
  if [ -n "$VALUE" ]; then
    if [ "$FIRST" = true ]; then FIRST=false; else ENV_JSON+=","; fi
    ESCAPED=$(printf '%s' "$VALUE" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))" 2>/dev/null || echo "\"$VALUE\"")
    ENV_JSON+="{\"key\":\"$KEY\",\"value\":$ESCAPED}"
    echo "  📌  $KEY"
  fi
done
ENV_JSON+="]"

echo ""
echo "🚀  Pushing env vars to Render..."
RESPONSE=$(curl -sf -X PUT \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"envVars\": $ENV_JSON}" \
  "https://api.render.com/v1/services/$SERVICE_ID/env-vars")

echo "✅  Done! Render will redeploy your backend automatically."
echo "    Check: https://dashboard.render.com"
