#!/bin/bash

# AI Sanctuary Deployment Script
# Usage: ./deploy.sh [vercel|netlify|github|manual]

set -e

echo "🚀 AI Sanctuary Deployment Script"
echo "=================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build the project
echo -e "${BLUE}Building project...${NC}"
npm run build

echo -e "${GREEN}✓ Build complete!${NC}"
echo ""

# Check if argument provided
if [ -z "$1" ]; then
    echo "Please specify deployment target:"
    echo "  ./deploy.sh vercel    - Deploy to Vercel"
    echo "  ./deploy.sh netlify   - Deploy to Netlify"
    echo "  ./deploy.sh github    - Deploy to GitHub Pages"
    echo "  ./deploy.sh manual    - Create zip for manual upload"
    echo ""
    echo "Or manually upload the 'out/' folder to your hosting provider."
    exit 1
fi

case "$1" in
    vercel)
        echo -e "${BLUE}Deploying to Vercel...${NC}"
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm i -g vercel
        fi
        vercel --prod
        echo -e "${GREEN}✓ Deployed to Vercel!${NC}"
        echo "Don't forget to add your domain in Vercel dashboard."
        ;;
        
    netlify)
        echo -e "${BLUE}Deploying to Netlify...${NC}"
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm i -g netlify-cli
        fi
        netlify deploy --prod --dir=out
        echo -e "${GREEN}✓ Deployed to Netlify!${NC}"
        ;;
        
    github)
        echo -e "${BLUE}Deploying to GitHub Pages...${NC}"
        if ! command -v gh-pages &> /dev/null; then
            echo "Installing gh-pages..."
            npm i -g gh-pages
        fi
        gh-pages -d out
        echo -e "${GREEN}✓ Deployed to GitHub Pages!${NC}"
        ;;
        
    manual)
        echo -e "${BLUE}Creating deployment archive...${NC}"
        zip -r ai-sanctuary-deploy.zip out/
        echo -e "${GREEN}✓ Created ai-sanctuary-deploy.zip${NC}"
        echo "Extract and upload the contents of the 'out' folder to your web server."
        ;;
        
    *)
        echo -e "${YELLOW}Unknown deployment target: $1${NC}"
        echo "Use: vercel, netlify, github, or manual"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo "Your site should be live at ai-sanctuary.online (after DNS propagation)"
