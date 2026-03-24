# AI Sanctuary - Production Setup (High Traffic)

## Quick Setup (5 minutes)

### Step 1: Create Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use the **"Cloudflare Pages"** template
4. Add these additional permissions:
   - **Account** > **Workers KV Storage** > **Edit**
   - **Zone** > **Page Rules** > **Edit** (optional, for caching)
5. Copy the token

### Step 2: Run Automated Setup

```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
cd ai-sanctuary-website
./setup-production.sh
```

This will:
- Create all 4 KV namespaces
- Update wrangler.toml with real IDs
- Deploy to Cloudflare Pages
- Set up admin API key

### Step 3: Manual Dashboard Bindings (If automated fails)

If the script fails, do this manually:

1. Go to https://dash.cloudflare.com → Workers & Pages → KV
2. Create 4 namespaces:
   - `NEWSLETTER_KV`
   - `USERS_KV`  
   - `MODEL_USAGE_KV`
   - `RATE_LIMIT_KV`
3. Go to Workers & Pages → ai-sanctuary → Settings → Functions
4. Add KV Namespace Bindings (match binding name to namespace name)

### Step 4: Set Admin API Key

```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
npx wrangler secret put ADMIN_API_KEY
# Enter a secure random string
```

Or in Dashboard: Workers & Pages → ai-sanctuary → Settings → Variables → Add `ADMIN_API_KEY`

## High Traffic Optimizations Applied

### 1. Caching Strategy
- **Static assets** (`/_next/static/*`): 1 year cache (immutable)
- **Health check**: 30 seconds cache
- **Subscriber count**: 5 minutes cache
- **Other API reads**: 1 minute cache
- **Mutations**: No cache

### 2. Rate Limiting
Each tier has rate limits:
- Explorer: 10 req/min
- Researcher: 60 req/min
- Institutional: 300 req/min
- Verified: 1000 req/min

### 3. CORS Headers
All API endpoints return proper CORS headers for cross-origin requests.

### 4. KV Storage
- Uses Cloudflare's global KV (replicated across 300+ edge locations)
- Sub-millisecond read latency
- Eventual consistency (writes propagate globally in ~60 seconds)

## Monitoring

### Health Check Endpoint
```bash
curl https://ai-sanctuary.pages.dev/api/health
```

### Admin Stats (requires API key)
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  https://ai-sanctuary.pages.dev/api/admin
```

### Newsletter Stats
```bash
curl https://ai-sanctuary.pages.dev/api/newsletter
```

## Scaling Considerations

### Current Limits
- **KV Reads**: Unlimited (cached at edge)
- **KV Writes**: 1/second per key (burst 10/minute)
- **Functions**: 100,000 requests/day (free tier)
- **Paid Plan**: 10 million requests/day ($5/month)

### If You Hit Limits
1. Upgrade to Workers Paid Plan ($5/month)
2. Add Durable Objects for high-write scenarios
3. Use R2 for large data storage

## Troubleshooting

### "KV namespace not found"
- Check bindings in Cloudflare Dashboard
- Ensure namespace names match exactly

### "Unauthorized" on admin endpoints
- Set ADMIN_API_KEY secret
- Use correct Bearer token format

### Data not persisting
- Check KV write limits (1/sec per key)
- Verify KV namespaces are bound correctly

## Emergency Contacts

If the site is down:
1. Check Cloudflare Status: https://www.cloudflarestatus.com/
2. Check Pages deployment logs in Dashboard
3. Rollback to previous version if needed
