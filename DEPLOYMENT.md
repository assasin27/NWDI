# 🚀 Production Deployment Guide

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git
- SSL Certificate (for HTTPS)
- Domain name (optional but recommended)

## 🔧 Environment Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env
```

Edit `.env` with your production values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Application Configuration
VITE_APP_NAME=FarmFresh
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Security Configuration
VITE_ENABLE_HTTPS=true
VITE_ENABLE_CSP=true
```

### 2. Database Setup

Run the database schema in your Supabase project:

```sql
-- Copy and execute the content from database_setup.sql
-- in your Supabase SQL Editor
```

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 2: Individual Docker Build

```bash
# Build the frontend image
docker build -t farmfresh-frontend .

# Run the container
docker run -d -p 8080:8080 --name farmfresh-app farmfresh-frontend
```

## 🌐 Manual Deployment

### 1. Build the Application

```bash
# Install dependencies
npm ci --only=production

# Build for production
npm run build:prod

# Test the build
npm run test:security
```

### 2. Deploy to Web Server

#### Nginx Configuration

Create `/etc/nginx/sites-available/farmfresh`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    root /var/www/farmfresh/dist;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### Deploy Files

```bash
# Copy built files to web server
sudo cp -r dist/* /var/www/farmfresh/

# Set permissions
sudo chown -R www-data:www-data /var/www/farmfresh
sudo chmod -R 755 /var/www/farmfresh

# Enable site
sudo ln -s /etc/nginx/sites-available/farmfresh /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Security Checklist

### ✅ Pre-deployment

- [ ] Environment variables configured
- [ ] Hardcoded secrets removed
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Database RLS policies enabled
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Rate limiting configured

### ✅ Post-deployment

- [ ] HTTPS redirect working
- [ ] Security headers present
- [ ] Error pages configured
- [ ] Health check endpoint responding
- [ ] Performance monitoring active
- [ ] Backup strategy implemented
- [ ] Logging configured

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check application health
curl -f https://your-domain.com/health

# Check Docker containers
docker ps

# Check nginx status
sudo systemctl status nginx
```

### Logs

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### Performance Monitoring

```bash
# Check Core Web Vitals
npm run test:performance

# Monitor resource usage
docker stats

# Check disk space
df -h
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:security
      - run: npm run build:prod

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          # Your deployment commands here
          echo "Deploying to production..."
```

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**
   ```bash
   npm run build:prod
   # Check for TypeScript errors
   ```

2. **Environment variables missing**
   ```bash
   # Verify .env file exists and has correct values
   cat .env
   ```

3. **Docker container won't start**
   ```bash
   docker logs farmfresh-frontend
   ```

4. **Nginx configuration error**
   ```bash
   sudo nginx -t
   ```

### Emergency Rollback

```bash
# Rollback to previous version
docker-compose -f docker-compose.prod.yml down
git checkout HEAD~1
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📞 Support

For deployment issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Test locally: `npm run build:prod && npm run preview`
4. Check security tests: `npm run test:security`

## 🔗 Useful Commands

```bash
# Quick deployment
npm run deploy:docker

# Security audit
npm run security:scan

# Performance test
npm run test:coverage

# Health check
curl -f http://localhost:8080/health
``` 