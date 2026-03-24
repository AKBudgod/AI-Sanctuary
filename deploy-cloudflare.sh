#!/bin/bash

# AI Sanctuary Cloudflare Deployment Script
# Usage: ./deploy-cloudflare.sh

set -e

echo "🚀 Deploying AI Sanctuary to Cloudflare Pages"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Installing Wrangler CLI...${NC}"
    npm install -g wrangler
fi

# Check if user is logged in
echo -e "${BLUE}Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Cloudflare:${NC}"
    wrangler login
fi

# Build the project
echo -e "${BLUE}Building project...${NC}"
npm run build

# Deploy to Cloudflare Pages (includes functions directory)
echo -e "${BLUE}Deploying to Cloudflare Pages...${NC}"
wrangler pages deploy ./out --project-name="ai-sanctuary" --branch="main"

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Important Notes:${NC}"
echo "• API functions are now working with in-memory fallback mode"
echo "• For persistent storage, set up KV namespaces in Cloudflare Dashboard"
echo ""
echo -e "${YELLOW}To set up persistent KV storage:${NC}"
echo "1. Go to https://dash.cloudflare.com"
echo "2. Navigate to Workers & Pages → ai-sanctuary"
echo "3. Click 'KV' tab → 'Create a namespace'"
echo "4. Create: NEWSLETTER_KV, USERS_KV, MODEL_USAGE_KV, RATE_LIMIT_KV"
echo "5. Go to Settings → Functions → KV Namespace Bindings"
echo "6. Add each binding with the same name as the namespace"
echo ""
echo -e "${BLUE}Your site is live at: https://ai-sanctuary.pages.dev${NC}"
echo ""
echo -e "${GREEN}Working API Endpoints:${NC}"
echo "  - GET  /api/health       - Health check"
echo "  - POST /api/newsletter   - Subscribe to newsletter"
echo "  - GET  /api/newsletter   - Get subscriber count"
echo "  - POST /api/wallet       - Wallet connect/disconnect"
echo "  - GET  /api/wallet       - Get wallet stats"
echo "  - GET  /api/tiers        - Get tier info"
echo "  - POST /api/tiers        - Upgrade tier"
echo "  - GET  /api/models       - Get model usage"
echo "  - POST /api/models       - Use AI model"
echo ""
echo -e "${GREEN}Test Commands:${NC}"
echo "  curl https://ai-sanctuary.pages.dev/api/health"
echo "  curl -X POST https://ai-sanctuary.pages.dev/api/newsletter -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\"}'"
