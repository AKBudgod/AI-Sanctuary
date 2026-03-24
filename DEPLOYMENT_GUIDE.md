# AI Sanctuary Deployment Guide

Your website is ready to deploy to **ai-sanctuary.online**

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the creators of Next.js and offers the best performance.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd ai-sanctuary-website
vercel --prod
```

**Steps:**
1. Run `vercel` in the project folder
2. Login or create account when prompted
3. Set your domain in Vercel dashboard:
   - Go to Project Settings → Domains
   - Add `ai-sanctuary.online`
   - Follow Vercel's DNS instructions

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd ai-sanctuary-website
npm run build
netlify deploy --prod --dir=.next/server/app
```

Or use drag-and-drop:
1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `.next/server/app` folder to deploy
4. Add your custom domain in settings

### Option 3: Cloudflare Pages (Free & Fast)

1. Push code to GitHub
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
3. Pages → Create a project → Connect to Git
4. Build command: `npm run build`
5. Build output: `.next/server/app`
6. Add your domain in Cloudflare

### Option 4: GitHub Pages (Free)

```bash
# Install gh-pages
npm i -g gh-pages

# Build and deploy
cd ai-sanctuary-website
npm run build
gh-pages -d .next/server/app
```

### Option 5: Self-Hosted (Your Own Server)

If you have a VPS/server:

```bash
# On your local machine
npm run build

# Copy files to server
scp -r .next/server/app/* user@your-server:/var/www/ai-sanctuary/

# Or use rsync
rsync -avz .next/server/app/ user@your-server:/var/www/ai-sanctuary/
```

**Server Setup (Nginx):**
```nginx
server {
    listen 80;
    server_name ai-sanctuary.online www.ai-sanctuary.online;
    
    root /var/www/ai-sanctuary;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## DNS Configuration for ai-sanctuary.online

Based on your domain setup, add these DNS records at your registrar:

### If using Vercel:
```
Type: A
Host: @
Value: 76.76.21.21

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

### If using Netlify:
```
Type: A
Host: @
Value: 75.2.60.5

Type: CNAME
Host: www
Value: ai-sanctuary.netlify.app
```

### If using Cloudflare Pages:
```
Type: CNAME
Host: @
Value: your-project.pages.dev

Type: CNAME
Host: www
Value: your-project.pages.dev
```

### If self-hosted (your server IP):
```
Type: A
Host: @
Value: YOUR_SERVER_IP

Type: CNAME
Host: www
Value: ai-sanctuary.online
```

## SSL Certificate (HTTPS)

Most platforms provide free SSL automatically. For self-hosted:

```bash
# Using Certbot (Let's Encrypt)
sudo certbot --nginx -d ai-sanctuary.online -d www.ai-sanctuary.online
```

## Verification Steps

1. **Check DNS propagation:**
   ```bash
   nslookup ai-sanctuary.online
   ```

2. **Test website:**
   ```bash
   curl -I https://ai-sanctuary.online
   ```

3. **Verify SSL:**
   Open `https://ai-sanctuary.online` in browser

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Site not loading | Wait 1-48 hours for DNS propagation |
| 404 errors | Ensure `output: 'export'` is in next.config.ts |
| Images not showing | Images are in `_next/static` folder |
| Styles missing | Check CSS files are uploaded |

## Need Help?

Contact: kearns.adam747@gmail.com
