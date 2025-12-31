# 🚀 Pocket Keeper - Deployment Guide

> **Version**: 1.0  
> **Last Updated**: December 2024  
> **Purpose**: Complete guide for deploying Pocket Keeper to various platforms

---

## Table of Contents

1. [GitHub Pages Deployment](#github-pages-deployment)
2. [Local Development](#local-development)
3. [Netlify Deployment](#netlify-deployment)
4. [Vercel Deployment](#vercel-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Troubleshooting](#troubleshooting)

---

## GitHub Pages Deployment

### Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` or `master` branch.

#### Setup Steps

1. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Build and deployment", select **GitHub Actions** as the source

2. **Push to main branch**
   - Any push to `main` or `master` triggers deployment
   - The workflow handles everything automatically

3. **Access your site**
   - URL: `https://<username>.github.io/<repository-name>/`
   - Wait 2-3 minutes after the first push for the site to be available

#### How It Works

The deployment is **dynamic** and works with any repository name:

```javascript
// vite.config.ts automatically determines base path
function getBasePath() {
  const githubRepo = process.env.GITHUB_REPOSITORY;
  if (githubRepo) {
    const repoName = githubRepo.split('/')[1];
    return `/${repoName}/`;
  }
  return '/';
}
```

The GitHub Actions workflow passes the `GITHUB_REPOSITORY` environment variable during build, so changing your repository name won't break the deployment.

#### Workflow File

Located at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          GITHUB_REPOSITORY: ${{ github.repository }}
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

### Manual Deployment

If you prefer manual deployment:

```bash
# Install dependencies
npm install

# Build with repository name
GITHUB_REPOSITORY="username/repo-name" npm run build

# The dist/ folder contains the built site
# Upload contents of dist/ to GitHub Pages manually
```

---

## Local Development

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or bun package manager

### Setup

```bash
# Clone repository
git clone https://github.com/username/pocket-keeper.git
cd pocket-keeper

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

---

## Netlify Deployment

### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### Option 2: Netlify Dashboard

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20

### Option 3: netlify.toml

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

# Handle SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Vercel Deployment

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 2: Vercel Dashboard

1. Import your GitHub repository in Vercel dashboard
2. Vercel automatically detects Vite configuration
3. Deploy with default settings

### Option 3: vercel.json

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Docker Deployment

### Using Docker

Create a `Dockerfile` for static hosting:

```dockerfile
# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build and Run

```bash
# Build image
docker build -t pocket-keeper .

# Run container
docker run -d -p 8080:80 pocket-keeper
```

### Docker Compose

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

---

## Troubleshooting

### White Screen on GitHub Pages

**Symptoms**: Site loads but shows blank/white page

**Causes & Solutions**:

1. **Incorrect base path**
   - The vite.config.ts now handles this automatically
   - Ensure `GITHUB_REPOSITORY` env var is set during build

2. **Cache issues**
   - Clear browser cache (Ctrl+Shift+R)
   - Wait a few minutes for CDN propagation

3. **Build errors**
   - Check GitHub Actions logs for build errors
   - Ensure all dependencies are correctly listed in package.json

4. **SPA routing issues**
   - GitHub Pages doesn't support SPA routing by default
   - The app uses hash routing which works without server config

### 404 Errors on Routes

**Problem**: Navigating directly to `/receipts` returns 404

**Solution**: Use hash router (already configured in this app)

```javascript
// React Router with hash
import { HashRouter } from 'react-router-dom';
```

### Assets Not Loading

**Problem**: Images, CSS, or JS files return 404

**Solution**: 
- Ensure base path is correct in vite.config.ts
- Check that asset paths use relative imports

```javascript
// Correct - relative import
import logo from './assets/logo.png';

// Incorrect - absolute path that ignores base
<img src="/assets/logo.png" />
```

### PWA Not Working

**Problem**: App doesn't install as PWA or offline doesn't work

**Solutions**:

1. **HTTPS required**: PWA features require HTTPS
   - GitHub Pages provides HTTPS automatically
   - For local testing, use `npm run preview`

2. **Service worker not registering**
   - Check browser console for SW errors
   - Ensure service worker is in correct location

3. **Cache not updating**
   - Clear site data in browser settings
   - Wait for service worker to update

### Build Failures

**Problem**: `npm run build` fails

**Common fixes**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

### Environment Variables Not Working

**Problem**: Environment variables not available in build

**Solution**: Vite requires `VITE_` prefix for client-side env vars

```bash
# .env
VITE_API_URL=https://api.example.com
```

```javascript
// Usage in code
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Performance Optimization

### Bundle Size

```bash
# Analyze bundle size
npm run build -- --analyze
```

### Caching

Add caching headers in your hosting configuration:

```nginx
# Static assets - long cache
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML - no cache (always check for updates)
location ~* \.html$ {
    expires 0;
    add_header Cache-Control "no-cache, must-revalidate";
}
```

### Compression

Enable gzip/brotli compression in your web server:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

---

## Monitoring

### Basic Health Check

Add a simple health check endpoint or verify:

```bash
# Check if site is accessible
curl -I https://username.github.io/pocket-keeper/
```

### Uptime Monitoring

Consider using:
- UptimeRobot (free tier available)
- Pingdom
- StatusPage

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] No sensitive data in client-side code
- [ ] Content Security Policy configured
- [ ] Dependencies up to date (`npm audit`)

---

*For additional help, open an issue on GitHub.*
