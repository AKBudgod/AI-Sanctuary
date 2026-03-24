#!/bin/bash

# FAST DEPLOY - AI Sanctuary Website
# Domain: ai-sanctuary.wjreviews420.workers.dev

set -e

echo "🚀 AI SANCTUARY - FAST DEPLOY"
echo "=============================="
echo "Domain: ai-sanctuary.wjreviews420.workers.dev"
echo ""

# Check token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ ERROR: Set your token first:"
    echo "  export CLOUDFLARE_API_TOKEN='your-token-here'"
    exit 1
fi

echo "✅ Token found"

# Check for OpenAI key
if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OpenAI API Key found"
    echo ""
    echo "🔑 Adding OpenAI key to Cloudflare secrets..."
    echo "$OPENAI_API_KEY" | npx wrangler secret put OPENAI_API_KEY --name="ai-sanctuary" 2>/dev/null || echo "   (Will add via dashboard)"
fi

echo ""
echo "🔨 Building..."
npm run build
echo "✅ Build complete"
echo ""

# Deploy
echo "🚀 DEPLOYING to ai-sanctuary.wjreviews420.workers.dev..."
npx wrangler pages deploy out --project-name="ai-sanctuary" --branch="main"

echo ""
echo "✅ DONE!"
echo ""
echo "🌐 Your site: https://ai-sanctuary.wjreviews420.workers.dev"
echo ""
echo "🧪 Quick Tests:"
echo "   - AI Playground: https://ai-sanctuary.wjreviews420.workers.dev/platform"
echo "   - Newsletter: https://ai-sanctuary.wjreviews420.workers.dev/community"
echo "   - Wallet: Connect on any page"
