#!/bin/bash

# Deploy AI Sanctuary using API Token (no browser auth needed)

echo "🚀 AI Sanctuary Deployment Script"
echo "=================================="
echo ""

# Check if token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN not set!"
    echo ""
    echo "To fix this, run:"
    echo "  export CLOUDFLARE_API_TOKEN='your-token-here'"
    echo ""
    echo "Get your token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "Create token with: Edit Cloudflare Workers permissions"
    exit 1
fi

echo "✅ API Token found"
echo ""

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Check if KV namespaces exist
echo "🔍 Checking KV namespaces..."
npx wrangler kv namespace list 2>/dev/null | grep -q "NEWSLETTER_KV"

if [ $? -ne 0 ]; then
    echo "⚠️  KV namespaces not found. Creating them..."
    echo ""
    
    echo "Creating NEWSLETTER_KV..."
    npx wrangler kv namespace create "NEWSLETTER_KV"
    
    echo "Creating USERS_KV..."
    npx wrangler kv namespace create "USERS_KV"
    
    echo "Creating MODEL_USAGE_KV..."
    npx wrangler kv namespace create "MODEL_USAGE_KV"
    
    echo "Creating RATE_LIMIT_KV..."
    npx wrangler kv namespace create "RATE_LIMIT_KV"
    
    echo ""
    echo "⚠️  IMPORTANT: Update wrangler.toml with the IDs above!"
    echo "Then run this script again."
    exit 0
fi

echo "✅ KV namespaces exist"
echo ""

# Deploy
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy out --project-name="ai-sanctuary"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Your site should be live shortly at:"
    echo "  https://ai-sanctuary.pages.dev"
    echo ""
    echo "Next steps:"
    echo "  1. Visit the URL above"
    echo "  2. Test the AI Playground on /platform"
    echo "  3. Test newsletter signup on /community"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error message above."
fi
