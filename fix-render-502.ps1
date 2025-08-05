# Fix Render 502 Error Script
# This script helps fix 502 errors on Render.com

Write-Host "🚨 Fixing Render 502 Error" -ForegroundColor Red
Write-Host "==========================" -ForegroundColor Red

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Step 1: Clean build cache
Write-Status "Step 1: Cleaning build cache..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Step 2: Reinstall dependencies
Write-Status "Step 2: Reinstalling dependencies..."
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Step 3: Build the application
Write-Status "Step 3: Building application..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

# Step 4: Check build output
Write-Status "Step 4: Checking build output..."
if (Test-Path "dist") {
    Write-Success "✓ dist directory exists"
    
    if (Test-Path "dist/index.html") {
        Write-Success "✓ index.html exists"
    } else {
        Write-Error "✗ index.html missing"
        exit 1
    }
    
    if (Test-Path "dist/assets") {
        Write-Success "✓ assets directory exists"
        $jsFiles = Get-ChildItem "dist/assets" -Filter "*.js" | Measure-Object
        $cssFiles = Get-ChildItem "dist/assets" -Filter "*.css" | Measure-Object
        Write-Status "Found $($jsFiles.Count) JavaScript files"
        Write-Status "Found $($cssFiles.Count) CSS files"
    } else {
        Write-Error "✗ assets directory missing"
        exit 1
    }
} else {
    Write-Error "✗ dist directory missing"
    exit 1
}

# Step 5: Test preview locally
Write-Status "Step 5: Testing preview locally..."
Start-Process -FilePath "npm" -ArgumentList "run", "preview" -NoNewWindow
Start-Sleep 10

# Step 6: Check if preview is working
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "✓ Preview is working locally"
    } else {
        Write-Error "✗ Preview failed locally"
    }
} catch {
    Write-Error "✗ Could not test preview locally"
}

# Step 7: Create _redirects file if it doesn't exist
Write-Status "Step 7: Creating _redirects file..."
$redirectsContent = "/*    /index.html   200"
if (-not (Test-Path "public/_redirects")) {
    New-Item -Path "public" -Name "_redirects" -ItemType File -Force
    Set-Content -Path "public/_redirects" -Value $redirectsContent
    Write-Success "✓ Created _redirects file"
} else {
    Write-Success "✓ _redirects file already exists"
}

# Step 8: Check for common issues
Write-Status "Step 8: Checking for common issues..."

# Check if vite.config.ts has base: '/'
$viteConfig = Get-Content "vite.config.ts" -Raw
if ($viteConfig -match "base:\s*'/'") {
    Write-Success "✓ Vite base path is configured correctly"
} else {
    Write-Error "✗ Vite base path not configured correctly"
}

# Check if package.json has correct build script
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if ($packageJson.scripts.build) {
    Write-Success "✓ Build script exists"
} else {
    Write-Error "✗ Build script missing"
}

# Step 9: Commit and push changes
Write-Status "Step 9: Preparing for deployment..."

Write-Host ""
Write-Host "🔧 Fix completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Commit your changes:"
Write-Host "   git add ."
Write-Host "   git commit -m 'Fix Render deployment issues'"
Write-Host "   git push"
Write-Host ""
Write-Host "2. Check Render dashboard for build logs"
Write-Host "3. Verify your site is working at your Render URL"
Write-Host ""
Write-Host "If you're still getting 502 errors:"
Write-Host "1. Check Render build logs for errors"
Write-Host "2. Verify all assets are in dist/assets/"
Write-Host "3. Test locally with: npm run preview"
Write-Host "4. Check browser console for any 404 errors" 