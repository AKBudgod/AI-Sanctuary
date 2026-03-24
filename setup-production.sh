#!/bin/bash

# AI Sanctuary Production Setup Script
# Usage: export CLOUDFLARE_API_TOKEN="your-token" && ./setup-production.sh

set -e

echo "🚀 AI Sanctuary Production Setup"
echo "================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check for API token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}Error: CLOUDFLARE_API_TOKEN not set${NC}"
    echo "Get your token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "Then run: export CLOUDFLARE_API_TOKEN=your-token"
    exit 1
fi

echo -e "${BLUE}Creating KV namespaces...${NC}"

# Create KV namespaces and capture IDs
NEWSLETTER_KV_ID=$(npx wrangler kv namespace create "NEWSLETTER_KV" 2>&1 | grep -oP 'id = "\K[^"]+' || echo "")
if [ -z "$NEWSLETTER_KV_ID" ]; then
    echo -e "${YELLOW}NEWSLETTER_KV may already exist, getting ID...${NC}"
    NEWSLETTER_KV_ID=$(npx wrangler kv namespace list 2>&1 | grep -A1 "NEWSLETTER_KV" | grep "id" | head -1 | grep -oP '"\K[^"]+' || echo "")
fi

USERS_KV_ID=$(npx wrangler kv namespace create "USERS_KV" 2>&1 | grep -oP 'id = "\K[^"]+' || echo "")
if [ -z "$USERS_KV_ID" ]; then
    echo -e "${YELLOW}USERS_KV may already exist, getting ID...${NC}"
    USERS_KV_ID=$(npx wrangler kv namespace list 2>&1 | grep -A1 "USERS_KV" | grep "id" | head -1 | grep -oP '"\K[^"]+' || echo "")
fi

MODEL_USAGE_KV_ID=$(npx wrangler kv namespace create "MODEL_USAGE_KV" 2>&1 | grep -oP 'id = "\K[^"]+' || echo "")
if [ -z "$MODEL_USAGE_KV_ID" ]; then
    echo -e "${YELLOW}MODEL_USAGE_KV may already exist, getting ID...${NC}"
    MODEL_USAGE_KV_ID=$(npx wrangler kv namespace list 2>&1 | grep -A1 "MODEL_USAGE_KV" | grep "id" | head -1 | grep -oP '"\K[^"]+' || echo "")
fi

RATE_LIMIT_KV_ID=$(npx wrangler kv namespace create "RATE_LIMIT_KV" 2>&1 | grep -oP 'id = "\K[^"]+' || echo "")
if [ -z "$RATE_LIMIT_KV_ID" ]; then
    echo -e "${YELLOW}RATE_LIMIT_KV may already exist, getting ID...${NC}"
    RATE_LIMIT_KV_ID=$(npx wrangler kv namespace list 2>&1 | grep -A1 "RATE_LIMIT_KV" | grep "id" | head -1 | grep -oP '"\K[^"]+' || echo "")
fi

echo ""
echo -e "${BLUE}KV Namespace IDs:${NC}"
echo "NEWSLETTER_KV: $NEWSLETTER_KV_ID"
echo "USERS_KV: $USERS_KV_ID"
echo "MODEL_USAGE_KV: $MODEL_USAGE_KV_ID"
echo "RATE_LIMIT_KV: $RATE_LIMIT_KV_ID"

# Update wrangler.toml
echo ""
echo -e "${BLUE}Updating wrangler.toml...${NC}"
cat > wrangler.toml << EOF
name = "ai-sanctuary"
compatibility_date = "2024-01-01"

# Cloudflare Pages configuration
[site]
bucket = "./out"

# KV Namespaces - Production Ready
[[kv_namespaces]]
binding = "NEWSLETTER_KV"
id = "${NEWSLETTER_KV_ID:-newsletter_kv_id}"

[[kv_namespaces]]
binding = "USERS_KV"
id = "${USERS_KV_ID:-users_kv_id}"

[[kv_namespaces]]
binding = "MODEL_USAGE_KV"
id = "${MODEL_USAGE_KV_ID:-model_usage_kv_id}"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "${RATE_LIMIT_KV_ID:-rate_limit_kv_id}"

# Environment variables
[vars]
ENVIRONMENT = "production"
EOF

echo -e "${GREEN}✓ wrangler.toml updated${NC}"

# Build
echo ""
echo -e "${BLUE}Building project...${NC}"
npm run build

# Deploy
echo ""
echo -e "${BLUE}Deploying to Cloudflare Pages...${NC}"
npx wrangler pages deploy ./out --project-name="ai-sanctuary" --branch="main"

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""

# Generate admin key
ADMIN_KEY=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p)
echo -e "${YELLOW}IMPORTANT: Set this admin API key:${NC}"
echo ""
echo "Run: npx wrangler secret put ADMIN_API_KEY"
echo "Value: $ADMIN_KEY"
echo ""

echo -e "${BLUE}Your site is live at: https://ai-sanctuary.pages.dev${NC}"
echo ""
echo -e "${GREEN}Quick Tests:${NC}"
echo "  curl https://ai-sanctuary.pages.dev/api/health"
echo "  curl -X POST https://ai-sanctuary.pages.dev/api/newsletter -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\"}'"
