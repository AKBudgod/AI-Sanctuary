# Cloudflare API Integration

This document describes the Cloudflare API integration for AI Sanctuary.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Next.js App   │────▶│  Cloudflare      │────▶│  Cloudflare │
│   (Static)      │     │  Pages Functions │     │  KV Storage │
└─────────────────┘     └──────────────────┘     └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │  Cloudflare │
                        │  Pages CDN  │
                        └─────────────┘
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns service status and timestamp.

### Newsletter
```
POST /api/newsletter
Body: { "email": "user@example.com" }
```
Subscribe an email to the newsletter.

```
GET /api/newsletter
```
Get total subscriber count.

### Wallet
```
POST /api/wallet
Body: { 
  "address": "0x...", 
  "chainId": 1, 
  "action": "connect" | "disconnect" 
}
```
Track wallet connections.

```
GET /api/wallet?address=0x...
```
Get wallet connection stats.

## KV Storage

### NEWSLETTER_KV
- `subscriber:${email}` - Individual subscription data
- `subscribers:list` - List of all subscribers

### USERS_KV
- `wallet:${address}` - Wallet connection history

## Deployment

### Prerequisites
1. Install Wrangler: `npm install -g wrangler`
2. Login: `wrangler login`

### Deploy
```bash
./deploy-cloudflare.sh
```

Or manually:
```bash
# Create KV namespaces
wrangler kv:namespace create "newsletter_subscriptions"
wrangler kv:namespace create "user_data"

# Build and deploy
npm run build
wrangler pages deploy ./out --project-name="ai-sanctuary"
```

## Environment Variables

Set these in the Cloudflare Dashboard or via Wrangler:

```bash
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_API_KEY
```

## Local Development

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start Wrangler for API
wrangler pages dev ./out --kv NEWSLETTER_KV --kv USERS_KV
```

## Testing

```bash
# Test health endpoint
curl https://ai-sanctuary.pages.dev/api/health

# Test newsletter subscription
curl -X POST https://ai-sanctuary.pages.dev/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test wallet connect
curl -X POST https://ai-sanctuary.pages.dev/api/wallet \
  -H "Content-Type: application/json" \
  -d '{"address":"0x123...","chainId":1,"action":"connect"}'
```
