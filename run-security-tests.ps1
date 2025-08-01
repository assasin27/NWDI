# Security Test Runner Script
# This script runs comprehensive security tests for the Farm Fresh Goods application

param(
    [string]$Category = "All",
    [switch]$Verbose,
    [switch]$GenerateReport,
    [switch]$CheckDependencies
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# Test categories
$Categories = @{
    "Frontend" = "Frontend security tests (XSS, client-side vulnerabilities)"
    "Backend" = "Backend API security tests (authentication, authorization)"
    "Config" = "Configuration security tests (settings, secrets)"
    "Integration" = "Integration security tests (end-to-end security)"
    "Dependencies" = "Dependency vulnerability scanning"
    "All" = "All security test categories"
}

function Write-SecurityHeader {
    Write-Host "`n🔒 SECURITY TEST SUITE" -ForegroundColor $Cyan
    Write-Host "Farm Fresh Goods Application" -ForegroundColor $Blue
    Write-Host "===============================================" -ForegroundColor $Cyan
}

function Write-TestCategory {
    param([string]$Category, [string]$Description)
    Write-Host "`n📋 $Category" -ForegroundColor $Yellow
    Write-Host "   $Description" -ForegroundColor $Blue
}

function Write-TestResult {
    param([string]$Test, [string]$Status, [string]$Details = "")
    $color = if ($Status -eq "PASS") { $Green } else { $Red }
    $icon = if ($Status -eq "PASS") { "✅" } else { "❌" }
    Write-Host "   $icon $Test - $Status" -ForegroundColor $color
    if ($Details) {
        Write-Host "      $Details" -ForegroundColor $Blue
    }
}

function Test-Prerequisites {
    Write-Host "`n🔍 Checking Prerequisites..." -ForegroundColor $Yellow
    
    $prerequisites = @{
        "Node.js" = "node --version"
        "npm" = "npm --version"
        "Python" = "python --version"
        "pip" = "pip --version"
        "Django" = "python -c 'import django; print(django.get_version())'"
    }
    
    $allGood = $true
    foreach ($tool in $prerequisites.Keys) {
        try {
            $version = Invoke-Expression $prerequisites[$tool] 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ $tool - Available" -ForegroundColor $Green
            } else {
                Write-Host "   ❌ $tool - Not found" -ForegroundColor $Red
                $allGood = $false
            }
        } catch {
            Write-Host "   ❌ $tool - Error checking" -ForegroundColor $Red
            $allGood = $false
        }
    }
    
    return $allGood
}

function Install-Dependencies {
    Write-Host "`n📦 Installing Dependencies..." -ForegroundColor $Yellow
    
    # Frontend dependencies
    Write-Host "   Installing frontend dependencies..." -ForegroundColor $Blue
    npm install --silent
    
    # Backend dependencies
    Write-Host "   Installing backend dependencies..." -ForegroundColor $Blue
    pip install -r backend/requirements.txt --quiet
    
    # Security testing dependencies
    Write-Host "   Installing security testing tools..." -ForegroundColor $Blue
    npm install --save-dev eslint-plugin-security @typescript-eslint/eslint-plugin --silent
    pip install bandit safety --quiet
}

function Run-FrontendSecurityTests {
    Write-TestCategory "Frontend Security Tests" "XSS, client-side vulnerabilities, authentication security"
    
    $tests = @(
        @{ Name = "Authentication Security"; Command = "npm test -- --testPathPattern=frontend-security.test.tsx" }
        @{ Name = "XSS Vulnerability Tests"; Command = "npm test -- --testPathPattern=xss-vulnerability.test.tsx" }
        @{ Name = "Client-Side Security"; Command = "npm test -- --testPathPattern=client-security.test.tsx" }
    )
    
    $results = @()
    foreach ($test in $tests) {
        try {
            Write-Host "   Running $($test.Name)..." -ForegroundColor $Blue
            $output = Invoke-Expression $test.Command 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-TestResult $test.Name "PASS"
                $results += @{ Test = $test.Name; Status = "PASS" }
            } else {
                Write-TestResult $test.Name "FAIL" "Test execution failed"
                $results += @{ Test = $test.Name; Status = "FAIL" }
            }
        } catch {
            Write-TestResult $test.Name "ERROR" "Test execution error"
            $results += @{ Test = $test.Name; Status = "ERROR" }
        }
    }
    
    return $results
}

function Run-BackendSecurityTests {
    Write-TestCategory "Backend Security Tests" "API security, authentication, authorization"
    
    $tests = @(
        @{ Name = "API Security Tests"; Command = "python backend/manage.py test backend.tests.security.api-security" }
        @{ Name = "Authentication Security"; Command = "python backend/manage.py test backend.tests.security.authentication-security" }
        @{ Name = "Input Validation Tests"; Command = "python backend/manage.py test backend.tests.security.input-validation" }
    )
    
    $results = @()
    foreach ($test in $tests) {
        try {
            Write-Host "   Running $($test.Name)..." -ForegroundColor $Blue
            $output = Invoke-Expression $test.Command 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-TestResult $test.Name "PASS"
                $results += @{ Test = $test.Name; Status = "PASS" }
            } else {
                Write-TestResult $test.Name "FAIL" "Test execution failed"
                $results += @{ Test = $test.Name; Status = "FAIL" }
            }
        } catch {
            Write-TestResult $test.Name "ERROR" "Test execution error"
            $results += @{ Test = $test.Name; Status = "ERROR" }
        }
    }
    
    return $results
}

function Run-ConfigurationSecurityTests {
    Write-TestCategory "Configuration Security Tests" "Settings, secrets, security headers"
    
    $tests = @(
        @{ Name = "Config Security Tests"; Command = "python backend/manage.py test backend.tests.security.config-security" }
        @{ Name = "Database Security"; Command = "python backend/manage.py test backend.tests.security.database-security" }
    )
    
    $results = @()
    foreach ($test in $tests) {
        try {
            Write-Host "   Running $($test.Name)..." -ForegroundColor $Blue
            $output = Invoke-Expression $test.Command 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-TestResult $test.Name "PASS"
                $results += @{ Test = $test.Name; Status = "PASS" }
            } else {
                Write-TestResult $test.Name "FAIL" "Test execution failed"
                $results += @{ Test = $test.Name; Status = "FAIL" }
            }
        } catch {
            Write-TestResult $test.Name "ERROR" "Test execution error"
            $results += @{ Test = $test.Name; Status = "ERROR" }
        }
    }
    
    return $results
}

function Run-DependencyVulnerabilityScan {
    Write-TestCategory "Dependency Vulnerability Scan" "Checking for known vulnerabilities"
    
    $results = @()
    
    # Frontend dependency scan
    try {
        Write-Host "   Scanning frontend dependencies..." -ForegroundColor $Blue
        $npmAudit = npm audit --json 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-TestResult "Frontend Dependencies" "PASS" "No vulnerabilities found"
            $results += @{ Test = "Frontend Dependencies"; Status = "PASS" }
        } else {
            Write-TestResult "Frontend Dependencies" "FAIL" "Vulnerabilities detected"
            $results += @{ Test = "Frontend Dependencies"; Status = "FAIL" }
        }
    } catch {
        Write-TestResult "Frontend Dependencies" "ERROR" "Scan failed"
        $results += @{ Test = "Frontend Dependencies"; Status = "ERROR" }
    }
    
    # Backend dependency scan
    try {
        Write-Host "   Scanning backend dependencies..." -ForegroundColor $Blue
        $safetyCheck = safety check --json 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-TestResult "Backend Dependencies" "PASS" "No vulnerabilities found"
            $results += @{ Test = "Backend Dependencies"; Status = "PASS" }
        } else {
            Write-TestResult "Backend Dependencies" "FAIL" "Vulnerabilities detected"
            $results += @{ Test = "Backend Dependencies"; Status = "FAIL" }
        }
    } catch {
        Write-TestResult "Backend Dependencies" "ERROR" "Scan failed"
        $results += @{ Test = "Backend Dependencies"; Status = "ERROR" }
    }
    
    return $results
}

function Run-IntegrationSecurityTests {
    Write-TestCategory "Integration Security Tests" "End-to-end security testing"
    
    $tests = @(
        @{ Name = "Integration Security"; Command = "npm test -- --testPathPattern=integration-security.test.tsx" }
    )
    
    $results = @()
    foreach ($test in $tests) {
        try {
            Write-Host "   Running $($test.Name)..." -ForegroundColor $Blue
            $output = Invoke-Expression $test.Command 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-TestResult $test.Name "PASS"
                $results += @{ Test = $test.Name; Status = "PASS" }
            } else {
                Write-TestResult $test.Name "FAIL" "Test execution failed"
                $results += @{ Test = $test.Name; Status = "FAIL" }
            }
        } catch {
            Write-TestResult $test.Name "ERROR" "Test execution error"
            $results += @{ Test = $test.Name; Status = "ERROR" }
        }
    }
    
    return $results
}

function Generate-SecurityReport {
    param([array]$Results)
    
    $reportPath = "security-test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Security Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .summary { background-color: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 3px; }
        .pass { background-color: #d5f4e6; border-left: 4px solid #27ae60; }
        .fail { background-color: #fadbd8; border-left: 4px solid #e74c3c; }
        .error { background-color: #fef9e7; border-left: 4px solid #f39c12; }
        .timestamp { color: #7f8c8d; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Security Test Report</h1>
        <p>Farm Fresh Goods Application</p>
        <p class="timestamp">Generated: $(Get-Date)</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Tests: $($Results.Count)</p>
        <p>Passed: $(($Results | Where-Object { $_.Status -eq "PASS" }).Count)</p>
        <p>Failed: $(($Results | Where-Object { $_.Status -eq "FAIL" }).Count)</p>
        <p>Errors: $(($Results | Where-Object { $_.Status -eq "ERROR" }).Count)</p>
    </div>
    
    <h2>Test Results</h2>
"@
    
    foreach ($result in $Results) {
        $statusClass = $result.Status.ToLower()
        $icon = if ($result.Status -eq "PASS") { "✅" } else { "❌" }
        
        $html += @"
    <div class="test-result $statusClass">
        <h3>$icon $($result.Test)</h3>
        <p><strong>Status:</strong> $($result.Status)</p>
        $(if ($result.Details) { "<p><strong>Details:</strong> $($result.Details)</p>" })
    </div>
"@
    }
    
    $html += @"
</body>
</html>
"@
    
    $html | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "`n📊 Security report generated: $reportPath" -ForegroundColor $Green
    return $reportPath
}

function Show-SecuritySummary {
    param([array]$Results)
    
    Write-Host "`n📊 SECURITY TEST SUMMARY" -ForegroundColor $Cyan
    Write-Host "================================" -ForegroundColor $Cyan
    
    $total = $Results.Count
    $passed = ($Results | Where-Object { $_.Status -eq "PASS" }).Count
    $failed = ($Results | Where-Object { $_.Status -eq "FAIL" }).Count
    $errors = ($Results | Where-Object { $_.Status -eq "ERROR" }).Count
    
    Write-Host "Total Tests: $total" -ForegroundColor $Blue
    Write-Host "✅ Passed: $passed" -ForegroundColor $Green
    Write-Host "❌ Failed: $failed" -ForegroundColor $Red
    Write-Host "⚠️  Errors: $errors" -ForegroundColor $Yellow
    
    $passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }
    Write-Host "`nPass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { $Green } else { $Red })
    
    if ($failed -gt 0 -or $errors -gt 0) {
        Write-Host "`n⚠️  Security issues detected! Please review failed tests." -ForegroundColor $Yellow
    } else {
        Write-Host "`n✅ All security tests passed!" -ForegroundColor $Green
    }
}

# Main execution
Write-SecurityHeader

# Check if category is valid
if (-not $Categories.ContainsKey($Category)) {
    Write-Host "❌ Invalid category: $Category" -ForegroundColor $Red
    Write-Host "Available categories:" -ForegroundColor $Yellow
    foreach ($cat in $Categories.Keys) {
        Write-Host "   $cat - $($Categories[$cat])" -ForegroundColor $Blue
    }
    exit 1
}

# Check prerequisites
if (-not (Test-Prerequisites)) {
    Write-Host "`n❌ Prerequisites not met. Please install required tools." -ForegroundColor $Red
    exit 1
}

# Install dependencies if needed
if ($CheckDependencies) {
    Install-Dependencies
}

# Run tests based on category
$allResults = @()

switch ($Category) {
    "Frontend" {
        $allResults += Run-FrontendSecurityTests
    }
    "Backend" {
        $allResults += Run-BackendSecurityTests
    }
    "Config" {
        $allResults += Run-ConfigurationSecurityTests
    }
    "Integration" {
        $allResults += Run-IntegrationSecurityTests
    }
    "Dependencies" {
        $allResults += Run-DependencyVulnerabilityScan
    }
    "All" {
        $allResults += Run-FrontendSecurityTests
        $allResults += Run-BackendSecurityTests
        $allResults += Run-ConfigurationSecurityTests
        $allResults += Run-IntegrationSecurityTests
        $allResults += Run-DependencyVulnerabilityScan
    }
}

# Generate report if requested
if ($GenerateReport) {
    $reportPath = Generate-SecurityReport -Results $allResults
}

# Show summary
Show-SecuritySummary -Results $allResults

Write-Host "`n🔒 Security test execution completed!" -ForegroundColor $Cyan 