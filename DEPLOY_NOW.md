# 🚀 DEPLOY NOW - Quick Reference

## For High Traffic - Production Ready

### Option 1: Automated (Fastest - 5 minutes)

```bash
# 1. Get API Token from https://dash.cloudflare.com/profile/api-tokens
#    Use "Cloudflare Pages" template + Workers KV Storage:Edit permission

# 2. Export token and run setup
export CLOUDFLARE_API_TOKEN="your-token-here"
cd ai-sanctuary-website
./setup-production.sh

# 3. Set admin key when prompted
npx wrangler secret put ADMIN_API_KEY
# Enter: (generate a random string)
```

### Option 2: Manual Dashboard (If no CLI access)

**Step 1: Create KV Namespaces**
1. Go to https://dash.cloudflare.com → Workers & Pages → KV
2. Create these 4 namespaces:
   - `NEWSLETTER_KV`
   - `USERS_KV`
   - `MODEL_USAGE_KV`
   - `RATE_LIMIT_KV`

**Step 2: Update wrangler.toml**
Edit each `id = "..."` with the actual namespace ID from the dashboard:
```toml
[[kv_namespaces]]
binding = "NEWSLETTER_KV"
id = "YOUR_ACTUAL_ID_HERE"
```

**Step 3: Deploy**
```bash
npm run build
npx wrangler pages deploy ./out --project-name="ai-sanctuary"
```

**Step 4: Bind KV in Dashboard**
1. Go to Workers & Pages → ai-sanctuary → Settings → Functions
2. Add KV Namespace Bindings for each namespace

### Option 3: Direct Upload (No KV - Demo Mode)

If you need it live RIGHT NOW without KV setup:

```bash
cd ai-sanctuary-website
npm run build
```

Then upload `out/` folder to:
- https://dash.cloudflare.com → Pages → ai-sanctuary

**Note:** Data won't persist between visits, but everything works for demo.

---

## ✅ What's Production Ready

| Feature | Status | Notes |
|---------|--------|-------|
| Static Pages | ✅ | Cached 1 year at edge |
| Newsletter API | ✅ | With KV persistence |
| Wallet Connect | ✅ | Tracks connections |
| Tier System | ✅ | Auto-upgrade in test mode |
| Model Playground | ✅ | Rate limited, usage tracked |
| Transparency Dashboard | ✅ | Full transparency data |
| Admin API | ✅ | With API key auth |
| CORS | ✅ | All endpoints |
| Caching | ✅ | Optimized per endpoint |

---

## 🔧 Performance Features

- **Global Edge Network**: 300+ locations
- **Static Assets**: 1 year cache
- **API Responses**: Smart caching (30s - 5min)
- **KV Storage**: Sub-millisecond reads globally
- **Rate Limiting**: Per-tier protection

---

## 📊 Monitoring

```bash
# Health check
curl https://ai-sanctuary.pages.dev/api/health

# Stats (admin only)
curl -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  https://ai-sanctuary.pages.dev/api/admin
```

---

## 🆘 Emergency

**Site down?**
1. Check: https://www.cloudflarestatus.com/
2. Check deployment logs in Cloudflare Dashboard
3. Rollback to previous version if needed

**Data issues?**
- KV has 1 write/sec limit per key
- Upgrades may take 60 seconds to propagate globally

---

## 📦 Files in Production Package

`ai-sanctuary-production.zip` contains:
- `out/` - Built website (ready to upload)
- `functions/` - API endpoints (4 KV namespaces)
- `wrangler.toml` - Configuration
- `setup-production.sh` - Automated setup script
- `PRODUCTION_SETUP.md` - Full guide

**Ready to deploy!**
