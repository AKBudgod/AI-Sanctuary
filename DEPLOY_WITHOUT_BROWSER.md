# Deploy AI Sanctuary WITHOUT Browser Authentication

Since browser-based Wrangler auth doesn't work in this environment, here are 3 alternative methods:

---

## 🔧 Method 1: API Token (Recommended)

### Step 1: Create API Token in Cloudflare Dashboard
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use template: "Edit Cloudflare Workers"
4. Or create custom token with these permissions:
   - **Cloudflare Pages**: Edit
   - **Workers Scripts**: Edit
   - **Account**: Read (for Workers)
   - **Zone**: Read (if using custom domain)
5. Copy the token (starts with something like `1a2b3c...`)

### Step 2: Use Token in Terminal
```bash
cd ai-sanctuary-website

# Set token as environment variable
export CLOUDFLARE_API_TOKEN="your-token-here"

# Now run wrangler commands
npx wrangler whoami  # Should show your account

# Create KV namespaces
npx wrangler kv namespace create "NEWSLETTER_KV"
npx wrangler kv namespace create "USERS_KV"
npx wrangler kv namespace create "MODEL_USAGE_KV"
npx wrangler kv namespace create "RATE_LIMIT_KV"
```

### Step 3: Update wrangler.toml
Replace the placeholder IDs with the actual IDs returned from the commands above.

### Step 4: Deploy
```bash
npm run build
npx wrangler pages deploy out
```

---

## 🔧 Method 2: Using wrangler.toml Credentials

Create a `wrangler.toml` with your account ID:

```toml
name = "ai-sanctuary"
account_id = "your-account-id-here"
compatibility_date = "2024-01-01"

# Rest of your config...
```

Then use the API token as shown in Method 1.

**Find your Account ID:**
- Go to any domain in Cloudflare dashboard
- Look on the right sidebar under "API"
- Copy "Account ID"

---

## 🔧 Method 3: Manual Upload (Easiest)

Skip Wrangler entirely and use the Cloudflare Dashboard:

### Step 1: Build Locally
```bash
cd ai-sanctuary-website
npm run build
```

### Step 2: Create ZIP
```bash
cd out
zip -r ../deploy.zip .
```

### Step 3: Upload via Dashboard
1. Go to https://dash.cloudflare.com/
2. Click "Workers & Pages" in sidebar
3. Click "Create application"
4. Choose "Pages" tab
5. Click "Upload assets"
6. Drag and drop the `deploy.zip` file
7. Project name: `ai-sanctuary`
8. Click "Deploy"

### Step 4: Add KV Namespaces (in Dashboard)
1. Go to your new Pages project
2. Click "Settings" tab
3. Click "Functions" in sidebar
4. Scroll to "KV namespace bindings"
5. Add these 4 bindings:
   - `NEWSLETTER_KV` → Create new namespace
   - `USERS_KV` → Create new namespace
   - `MODEL_USAGE_KV` → Create new namespace
   - `RATE_LIMIT_KV` → Create new namespace

### Step 5: Redeploy
After adding KV bindings, click "Deployments" → "Retry deployment"

---

## 🔧 Method 4: GitHub Actions (Automatic)

Set up automatic deployment on every git push:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: cd ai-sanctuary-website && npm ci
        
      - name: Build
        run: cd ai-sanctuary-website && npm run build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: ai-sanctuary
          directory: ai-sanctuary-website/out
```

Then add secrets in GitHub:
1. Go to your repo → Settings → Secrets and variables → Actions
2. Add `CLOUDFLARE_API_TOKEN` (from Method 1)
3. Add `CLOUDFLARE_ACCOUNT_ID` (from Method 2)

---

## ✅ Quick Checklist

- [ ] Build succeeds: `npm run build`
- [ ] KV namespaces created
- [ ] API token set: `export CLOUDFLARE_API_TOKEN="..."`
- [ ] Deployed: `npx wrangler pages deploy out`
- [ ] Site loads at the URL provided

---

## 🚨 Troubleshooting

### "Authentication error"
- Make sure token has correct permissions
- Try: `npx wrangler logout` then set token again

### "KV namespace not found"
- You MUST create KV namespaces before deploying
- Or the API won't work (newsletter, wallet tracking, etc.)

### "Build fails"
- Run: `npm install` first
- Then: `npm run build`

---

**Fastest option for right now**: Method 3 (Manual Upload via Dashboard)
