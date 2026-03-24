#!/bin/bash
# AI Sanctuary - Deploy Commands
# Run these in your terminal

echo "🚀 AI Sanctuary Deployment"
echo "=========================="

# Step 1: Get your Cloudflare API Token
echo ""
echo "Step 1: Get API Token"
echo "Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "Click: 'Create Token'"
echo "Use Template: 'Cloudflare Pages'"
echo "Add permission: Workers KV Storage > Edit"
echo "Copy the token"
echo ""
read -p "Press Enter when you have the token..."

# Step 2: Set the token
echo ""
echo "Step 2: Set API Token"
echo "Run this command:"
echo "export CLOUDFLARE_API_TOKEN=your-token-here"
echo ""
read -p "Press Enter after running the export command..."

# Step 3: Deploy
echo ""
echo "Step 3: Deploying..."
cd ai-sanctuary-website
./setup-production.sh

echo ""
echo "Step 4: Add OpenRouter API Key (Optional)"
echo "Run: npx wrangler secret put OPENROUTER_API_KEY"
echo "Get key from: https://openrouter.ai/keys"
echo ""

echo "✅ Done! Your site will be live at: https://ai-sanctuary.pages.dev"
