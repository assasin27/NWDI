# 🚀 Render.com Deployment Guide

## 📋 Overview

This guide helps you deploy your FarmFresh application to Render.com as a static site.

## 🔧 Prerequisites

- Render.com account
- Git repository with your code
- Node.js 18+ installed locally

## 🚀 Quick Deployment Steps

### **1. Prepare Your Repository**

Ensure your repository has these files:
- `package.json` with build script
- `vite.config.ts` with proper configuration
- `render.yaml` (optional, for automatic deployment)

### **2. Connect to Render**

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Static Site"
3. Connect your Git repository
4. Configure the deployment settings

### **3. Render Configuration**

#### **Build Command:**
```bash
npm install && npm run build
```

#### **Publish Directory:**
```
dist
```

#### **Environment Variables:**
```
NODE_VERSION=18.17.0
NPM_VERSION=9.6.7
```

## 🔧 Configuration Files

### **render.yaml**
```yaml
services:
  - type: web
    name: farmfresh-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: NODE_VERSION
        value: 18.17.0
      - key: NPM_VERSION
        value: 9.6.7
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### **vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
```

### **_redirects**
```
/*    /index.html   200
```

## 🚨 Common Issues and Solutions

### **502 Bad Gateway Error**

#### **Root Causes:**
1. **Build Failure**: The build process failed
2. **Missing Files**: Required files not in `dist/` directory
3. **Asset Loading**: Assets not properly built or referenced
4. **React Router**: Routes not properly configured

#### **Solutions:**

**1. Check Build Logs**
- Go to your Render dashboard
- Click on your service
- Check the "Build Logs" tab
- Look for any error messages

**2. Verify Build Output**
```bash
# Test locally first
npm run build
ls -la dist/
ls -la dist/assets/
```

**3. Check Asset References**
- Ensure all assets are in `dist/assets/`
- Verify `index.html` references assets correctly
- Check for any 404 errors in browser console

**4. Fix React Router**
- Add `_redirects` file in `public/` directory
- Ensure all routes redirect to `index.html`

### **Build Failures**

#### **Common Build Issues:**

**1. Node Version Mismatch**
```bash
# Set Node version in package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**2. Missing Dependencies**
```bash
# Ensure all dependencies are in package.json
npm install
npm run build
```

**3. TypeScript Errors**
```bash
# Fix TypeScript errors
npm run lint
npm run build
```

### **Asset Loading Issues**

**1. Check Asset Paths**
- Verify assets are in `dist/assets/`
- Check `index.html` for correct asset references
- Ensure no absolute paths in asset URLs

**2. Fix Asset References**
```html
<!-- Correct asset reference -->
<script type="module" src="/assets/index-abc123.js"></script>
<link rel="stylesheet" href="/assets/index-def456.css">
```

## 🔍 Debugging Steps

### **1. Local Testing**
```bash
# Build locally
npm run build

# Test the build
npm run preview

# Check if assets load
curl http://localhost:8080/
curl http://localhost:8080/assets/
```

### **2. Check Render Logs**
1. Go to Render dashboard
2. Click on your service
3. Check "Build Logs" and "Runtime Logs"
4. Look for error messages

### **3. Verify File Structure**
```bash
# Expected structure after build
dist/
├── index.html
├── assets/
│   ├── index-abc123.js
│   ├── index-def456.css
│   └── vendor-ghi789.js
└── _redirects
```

### **4. Test Asset Loading**
```bash
# Check if assets are accessible
curl -I https://your-app.onrender.com/assets/index-abc123.js
curl -I https://your-app.onrender.com/assets/index-def456.css
```

## 🛠️ Advanced Configuration

### **Environment Variables**

Set these in Render dashboard:
```
NODE_VERSION=18.17.0
NPM_VERSION=9.6.7
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### **Custom Domain**

1. Go to your service in Render dashboard
2. Click "Settings" → "Custom Domains"
3. Add your domain
4. Update DNS records

### **Auto-Deploy**

1. Connect your Git repository
2. Enable "Auto-Deploy"
3. Set branch (usually `main` or `master`)
4. Render will deploy on every push

## 📊 Monitoring

### **Health Checks**
- Render automatically checks your site
- Monitor uptime in dashboard
- Set up alerts for downtime

### **Performance**
- Use browser dev tools
- Check network tab for slow assets
- Monitor Core Web Vitals

## 🚨 Emergency Fixes

### **Immediate 502 Fix**
1. **Check build logs** in Render dashboard
2. **Verify `dist/` directory** has files
3. **Test locally** with `npm run build && npm run preview`
4. **Redeploy** by pushing to your repository

### **Complete Reset**
```bash
# Clean everything
rm -rf node_modules package-lock.json dist/

# Reinstall and rebuild
npm install
npm run build

# Test locally
npm run preview

# Push to trigger deployment
git add .
git commit -m "Fix deployment issues"
git push
```

## 📞 Getting Help

### **Render Support**
- Check [Render Documentation](https://render.com/docs)
- Contact Render support
- Check Render status page

### **Common Solutions**
1. **Clear cache**: Delete `node_modules` and reinstall
2. **Update dependencies**: Run `npm update`
3. **Check Node version**: Ensure compatibility
4. **Verify build**: Test locally before deploying

### **Debug Commands**
```bash
# Test build locally
npm run build

# Check build output
ls -la dist/

# Test preview
npm run preview

# Check for errors
npm run lint
```

---

**Remember**: The 502 error on Render usually means the build failed or assets aren't loading properly. Always test your build locally first! 