# Comprehensive Test Runner for Farm Fresh E-commerce Application
# This script runs all tests in the test suite and generates comprehensive reports

param(
    [string]$TestType = "all",  # all, frontend, backend, integration, performance
    [switch]$Coverage,
    [switch]$Verbose,
    [switch]$Watch,
    [switch]$GenerateReport
)

Write-Host "🚀 Starting Comprehensive Test Suite for Farm Fresh E-commerce Application" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green

# Configuration
$FrontendTestCommand = "npm test"
$BackendTestCommand = "cd backend && python -m pytest"
$CoverageCommand = "npm test -- --coverage --watchAll=false"
$BackendCoverageCommand = "cd backend && python -m pytest --cov --cov-report=html --cov-report=term-missing"

# Test Results
$TestResults = @{
    Frontend = @{ Passed = 0; Failed = 0; Total = 0 }
    Backend = @{ Passed = 0; Failed = 0; Total = 0 }
    Integration = @{ Passed = 0; Failed = 0; Total = 0 }
    Performance = @{ Passed = 0; Failed = 0; Total = 0 }
}

# Function to run tests and capture results
function Run-TestSuite {
    param(
        [string]$SuiteName,
        [string]$Command,
        [string]$WorkingDirectory = "."
    )
    
    Write-Host "`n📋 Running $SuiteName Tests..." -ForegroundColor Yellow
    
    $originalLocation = Get-Location
    Set-Location $WorkingDirectory
    
    try {
        $startTime = Get-Date
        $result = Invoke-Expression $Command 2>&1
        $endTime = Get-Date
        $duration = $endTime - $startTime
        
        # Parse test results (basic parsing - can be enhanced)
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $SuiteName tests completed successfully" -ForegroundColor Green
            $TestResults[$SuiteName].Passed++
        } else {
            Write-Host "❌ $SuiteName tests failed" -ForegroundColor Red
            $TestResults[$SuiteName].Failed++
        }
        
        $TestResults[$SuiteName].Total++
        
        if ($Verbose) {
            Write-Host "Output:" -ForegroundColor Gray
            Write-Host $result
        }
        
        Write-Host "⏱️  Duration: $($duration.TotalSeconds.ToString('F2')) seconds" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Error running $SuiteName tests: $_" -ForegroundColor Red
        $TestResults[$SuiteName].Failed++
        $TestResults[$SuiteName].Total++
    } finally {
        Set-Location $originalLocation
    }
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Host "🔍 Checking Prerequisites..." -ForegroundColor Blue
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js not found. Please install Node.js." -ForegroundColor Red
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ npm not found. Please install npm." -ForegroundColor Red
        exit 1
    }
    
    # Check Python
    try {
        $pythonVersion = python --version
        Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Python not found. Please install Python." -ForegroundColor Red
        exit 1
    }
    
    # Check if package.json exists
    if (-not (Test-Path "package.json")) {
        Write-Host "❌ package.json not found. Please run this script from the project root." -ForegroundColor Red
        exit 1
    }
    
    # Check if backend directory exists
    if (-not (Test-Path "backend")) {
        Write-Host "❌ backend directory not found." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ All prerequisites met!" -ForegroundColor Green
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "📦 Installing Dependencies..." -ForegroundColor Blue
    
    # Install frontend dependencies
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    
    # Install backend dependencies
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    cd backend
    pip install -r requirements-test.txt
    cd ..
    
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
}

# Function to run frontend tests
function Run-FrontendTests {
    Write-Host "`n🎨 Running Frontend Tests..." -ForegroundColor Magenta
    
    if ($Coverage) {
        Run-TestSuite "Frontend" $CoverageCommand
    } else {
        Run-TestSuite "Frontend" $FrontendTestCommand
    }
}

# Function to run backend tests
function Run-BackendTests {
    Write-Host "`n🔧 Running Backend Tests..." -ForegroundColor Magenta
    
    if ($Coverage) {
        Run-TestSuite "Backend" $BackendCoverageCommand "backend"
    } else {
        Run-TestSuite "Backend" $BackendTestCommand "backend"
    }
}

# Function to run integration tests
function Run-IntegrationTests {
    Write-Host "`n🔗 Running Integration Tests..." -ForegroundColor Magenta
    
    $integrationCommand = "npm test -- integration/"
    Run-TestSuite "Integration" $integrationCommand
}

# Function to run performance tests
function Run-PerformanceTests {
    Write-Host "`n⚡ Running Performance Tests..." -ForegroundColor Magenta
    
    $performanceCommand = "npm test -- performance/"
    Run-TestSuite "Performance" $performanceCommand
}

# Function to run specific component tests
function Run-ComponentTests {
    Write-Host "`n🧩 Running Component Tests..." -ForegroundColor Magenta
    
    $components = @(
        "ProductsSection",
        "ProductCard", 
        "VariantSelector",
        "CartDrawer",
        "NavBar"
    )
    
    foreach ($component in $components) {
        Write-Host "Testing $component component..." -ForegroundColor Yellow
        $componentCommand = "npm test -- $component.test.tsx"
        Run-TestSuite "Frontend" $componentCommand
    }
}

# Function to run hook tests
function Run-HookTests {
    Write-Host "`n🎣 Running Hook Tests..." -ForegroundColor Magenta
    
    $hooks = @(
        "useCart",
        "useWishlist",
        "use-mobile",
        "use-toast"
    )
    
    foreach ($hook in $hooks) {
        Write-Host "Testing $hook hook..." -ForegroundColor Yellow
        $hookCommand = "npm test -- $hook.test.tsx"
        Run-TestSuite "Frontend" $hookCommand
    }
}

# Function to run service tests
function Run-ServiceTests {
    Write-Host "`n🔧 Running Service Tests..." -ForegroundColor Magenta
    
    $services = @(
        "cartService",
        "wishlistService",
        "productService",
        "orderService",
        "emailService"
    )
    
    foreach ($service in $services) {
        Write-Host "Testing $service service..." -ForegroundColor Yellow
        $serviceCommand = "npm test -- $service.test.ts"
        Run-TestSuite "Frontend" $serviceCommand
    }
}

# Function to generate test report
function Generate-TestReport {
    param([string]$ReportPath = "test-report.html")
    
    Write-Host "`n📊 Generating Test Report..." -ForegroundColor Blue
    
    $reportContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>Farm Fresh E-commerce - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; border-radius: 5px; }
        .summary { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .test-suite { margin: 20px 0; padding: 15px; border-left: 4px solid #2196F3; }
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .total { color: #2196F3; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Farm Fresh E-commerce Test Report</h1>
        <p>Generated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
    </div>
    
    <div class="summary">
        <h2>📋 Test Summary</h2>
        <p><strong>Total Tests:</strong> <span class="total">$($TestResults.Values | ForEach-Object { $_.Total } | Measure-Object -Sum).Sum</span></p>
        <p><strong>Passed:</strong> <span class="passed">$($TestResults.Values | ForEach-Object { $_.Passed } | Measure-Object -Sum).Sum</span></p>
        <p><strong>Failed:</strong> <span class="failed">$($TestResults.Values | ForEach-Object { $_.Failed } | Measure-Object -Sum).Sum</span></p>
    </div>
    
    <div class="test-suite">
        <h3>🎨 Frontend Tests</h3>
        <p>Total: $($TestResults.Frontend.Total) | Passed: <span class="passed">$($TestResults.Frontend.Passed)</span> | Failed: <span class="failed">$($TestResults.Frontend.Failed)</span></p>
    </div>
    
    <div class="test-suite">
        <h3>🔧 Backend Tests</h3>
        <p>Total: $($TestResults.Backend.Total) | Passed: <span class="passed">$($TestResults.Backend.Passed)</span> | Failed: <span class="failed">$($TestResults.Backend.Failed)</span></p>
    </div>
    
    <div class="test-suite">
        <h3>🔗 Integration Tests</h3>
        <p>Total: $($TestResults.Integration.Total) | Passed: <span class="passed">$($TestResults.Integration.Passed)</span> | Failed: <span class="failed">$($TestResults.Integration.Failed)</span></p>
    </div>
    
    <div class="test-suite">
        <h3>⚡ Performance Tests</h3>
        <p>Total: $($TestResults.Performance.Total) | Passed: <span class="passed">$($TestResults.Performance.Passed)</span> | Failed: <span class="failed">$($TestResults.Performance.Failed)</span></p>
    </div>
</body>
</html>
"@
    
    $reportContent | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-Host "✅ Test report generated: $ReportPath" -ForegroundColor Green
}

# Function to display test coverage
function Show-TestCoverage {
    Write-Host "`n📊 Test Coverage Summary" -ForegroundColor Blue
    Write-Host "========================" -ForegroundColor Blue
    
    $totalTests = ($TestResults.Values | ForEach-Object { $_.Total } | Measure-Object -Sum).Sum
    $totalPassed = ($TestResults.Values | ForEach-Object { $_.Passed } | Measure-Object -Sum).Sum
    $totalFailed = ($TestResults.Values | ForEach-Object { $_.Failed } | Measure-Object -Sum).Sum
    
    if ($totalTests -gt 0) {
        $coveragePercentage = [math]::Round(($totalPassed / $totalTests) * 100, 2)
        Write-Host "Overall Coverage: $coveragePercentage%" -ForegroundColor Green
        
        foreach ($suite in $TestResults.Keys) {
            $suiteData = $TestResults[$suite]
            if ($suiteData.Total -gt 0) {
                $suiteCoverage = [math]::Round(($suiteData.Passed / $suiteData.Total) * 100, 2)
                Write-Host "$suite`: $suiteCoverage% ($($suiteData.Passed)/$($suiteData.Total))" -ForegroundColor Cyan
            }
        }
    }
}

# Main execution
try {
    # Check prerequisites
    Test-Prerequisites
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Install-Dependencies
    }
    
    # Run tests based on test type
    switch ($TestType.ToLower()) {
        "all" {
            Run-FrontendTests
            Run-BackendTests
            Run-IntegrationTests
            Run-PerformanceTests
        }
        "frontend" {
            Run-FrontendTests
            Run-ComponentTests
            Run-HookTests
            Run-ServiceTests
        }
        "backend" {
            Run-BackendTests
        }
        "integration" {
            Run-IntegrationTests
        }
        "performance" {
            Run-PerformanceTests
        }
        "components" {
            Run-ComponentTests
        }
        "hooks" {
            Run-HookTests
        }
        "services" {
            Run-ServiceTests
        }
        default {
            Write-Host "❌ Invalid test type: $TestType" -ForegroundColor Red
            Write-Host "Valid options: all, frontend, backend, integration, performance, components, hooks, services" -ForegroundColor Yellow
            exit 1
        }
    }
    
    # Show coverage summary
    Show-TestCoverage
    
    # Generate report if requested
    if ($GenerateReport) {
        Generate-TestReport
    }
    
    # Final summary
    Write-Host "`n🎉 Test Suite Execution Complete!" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    
    $totalTests = ($TestResults.Values | ForEach-Object { $_.Total } | Measure-Object -Sum).Sum
    $totalPassed = ($TestResults.Values | ForEach-Object { $_.Passed } | Measure-Object -Sum).Sum
    $totalFailed = ($TestResults.Values | ForEach-Object { $_.Failed } | Measure-Object -Sum).Sum
    
    Write-Host "📊 Total Tests: $totalTests" -ForegroundColor Cyan
    Write-Host "✅ Passed: $totalPassed" -ForegroundColor Green
    Write-Host "❌ Failed: $totalFailed" -ForegroundColor Red
    
    if ($totalFailed -gt 0) {
        Write-Host "`n⚠️  Some tests failed. Please review the output above." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "`n🎊 All tests passed successfully!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error during test execution: $_" -ForegroundColor Red
    exit 1
} 