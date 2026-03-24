# Cloudflare Setup for ai-sanctuary.online

## Option 1: Cloudflare Pages (Recommended - Free)

### Step 1: Deploy
```bash
cd ai-sanctuary-website

# Install Wrangler if not already installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy ./out --project-name="ai-sanctuary"
```

Or manually:
1. Go to https://dash.cloudflare.com
2. Click "Pages" in the sidebar
3. "Create a project" → "Upload assets"
4. Drag and drop the `out/` folder
5. Project name: `ai-sanctuary`

### Step 2: Connect Your Domain
1. In Cloudflare Pages, go to your project
2. Click "Custom domains" tab
3. Click "Set up a custom domain"
4. Enter: `ai-sanctuary.online`
5. Click "Continue"
6. Cloudflare will automatically configure DNS

### Step 3: DNS Records (if not auto-configured)
Cloudflare should auto-add these, but verify:

| Type | Name | Target | Proxy Status |
|------|------|--------|--------------|
| CNAME | @ | ai-sanctuary.pages.dev | Proxied (orange cloud) |
| CNAME | www | ai-sanctuary.pages.dev | Proxied (orange cloud) |

## Option 2: Cloudflare as DNS + Other Hosting

If you're hosting elsewhere but want Cloudflare for DNS/CDN:

### DNS Records

| Type | Name | Content | TTL | Proxy Status |
|------|------|---------|-----|--------------|
| A | @ | YOUR_SERVER_IP | Auto | Proxied 🟠 |
| CNAME | www | ai-sanctuary.online | Auto | Proxied 🟠 |
| TXT | @ | google-site-verification=9paJUiRFUj2VJ3niAoJcc_xbmJF0If_9etXFH5zryqQ | Auto | DNS only |
| TXT | @ | v=spf1 include:_spf.google.com ~all | Auto | DNS only |

### For Vercel + Cloudflare:
| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| CNAME | @ | cname.vercel-dns.com | DNS only (gray cloud) |
| CNAME | www | cname.vercel-dns.com | DNS only (gray cloud) |

### For Netlify + Cloudflare:
| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| CNAME | @ | ai-sanctuary.netlify.app | DNS only (gray cloud) |
| CNAME | www | ai-sanctuary.netlify.app | DNS only (gray cloud) |

## Step-by-Step Cloudflare DNS Setup

1. **Login to Cloudflare**
   - https://dash.cloudflare.com

2. **Select your domain**
   - Click on `ai-sanctuary.online`

3. **Go to DNS section**
   - Sidebar → "DNS" → "Records"

4. **Clear existing records** (optional but recommended)
   - Delete old A, CNAME, AAA records

5. **Add new records**
   
   Click "Add record" and enter:
   
   **Record 1 - Root domain:**
   - Type: CNAME
   - Name: @
   - Target: ai-sanctuary.pages.dev
   - TTL: Auto
   - Proxy status: Proxied (orange cloud) ✓
   
   **Record 2 - WWW:**
   - Type: CNAME
   - Name: www
   - Target: ai-sanctuary.online
   - TTL: Auto
   - Proxy status: Proxied (orange cloud) ✓
   
   **Record 3 - Google Verification:**
   - Type: TXT
   - Name: @
   - Content: google-site-verification=9paJUiRFUj2VJ3niAoJcc_xbmJF0If_9etXFH5zryqQ
   - TTL: Auto
   - Proxy status: DNS only (gray cloud)

6. **SSL/TLS Settings**
   - Go to "SSL/TLS" in sidebar
   - Set mode to: "Full (strict)"
   - Edge Certificates: Should show "Active" for your domain

7. **Always Use HTTPS**
   - Go to "SSL/TLS" → "Edge Certificates"
   - Enable "Always Use HTTPS"

8. **Auto Minify (optional)**
   - Speed → Optimization → Auto Minify
   - Enable: JavaScript, CSS, HTML

## Quick Deploy Script

```bash
# Make script executable
chmod +x deploy-cloudflare.sh

# Deploy
./deploy-cloudflare.sh
```

## Verify It's Working

Test these commands:

```bash
# Check DNS
nslookup ai-sanctuary.online

# Should show Cloudflare IPs (104.21.x.x or 172.67.x.x)

# Check SSL
curl -I https://ai-sanctuary.online
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| DNS_PROBE_FINISHED_NXDOMAIN | Wait longer (up to 24 hours) |
| ERR_SSL_VERSION_OR_CIPHER_MISMATCH | Set SSL to "Full (strict)" |
| 526 Invalid SSL Certificate | Set SSL to "Full" not "Strict" |
| Too many redirects | Disable "Always Use HTTPS" on Cloudflare |
| CSS/JS not loading | Check rocket loader is off in Speed settings |

## Cloudflare Benefits You'll Get

✅ **Free SSL Certificate** - Auto-renews
✅ **Global CDN** - Faster loading worldwide
✅ **DDoS Protection** - Built-in security
✅ **Analytics** - See traffic stats
✅ **Page Rules** - Redirects, caching controls
✅ **Workers** - Edge computing (if needed later)

## Need Help?

Cloudflare support: https://support.cloudflare.com

Or run this to check status:
```bash
dig ai-sanctuary.online +short
dig ai-sanctuary.online ANY
```
