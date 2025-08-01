# PowerShell script to run both frontend and backend tests

# Set error action preference to stop on error
$ErrorActionPreference = "Stop"

# Display header
Write-Host "\n===== Running All Tests =====\n" -ForegroundColor Cyan

# Function to run a command and check its exit code
function Run-Command {
    param (
        [string]$Name,
        [scriptblock]$Command
    )
    
    Write-Host "\n----- Running $Name Tests -----\n" -ForegroundColor Yellow
    
    try {
        & $Command
        if ($LASTEXITCODE -ne 0) {
            Write-Host "$Name tests failed with exit code $LASTEXITCODE" -ForegroundColor Red
            return $false
        } else {
            Write-Host "$Name tests completed successfully" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "Error running $Name tests: $_" -ForegroundColor Red
        return $false
    }
}

# Fix line endings in git repository
Write-Host "\n----- Fixing Line Endings -----\n" -ForegroundColor Yellow
Run-Command -Name "Git Config" -Command { 
    git config core.autocrlf false
    git config core.eol lf
}

# Track overall success
$success = $true

# Run frontend tests
$frontendSuccess = Run-Command -Name "Frontend" -Command { npm test -- --config=jest.config.cjs }
if (-not $frontendSuccess) { $success = $false }

# Change to backend directory and run backend tests
Push-Location "$PSScriptRoot\backend"
try {
    # Install Python dependencies
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    $installDepsSuccess = Run-Command -Name "Python Dependencies" -Command { 
        python -m pip install setuptools
        python -m pip install -r requirements.txt
    }
    
    if ($installDepsSuccess) {
        # Set environment variable for Django settings
        $env:DJANGO_SETTINGS_MODULE = "farmfresh_backend.settings"
        
        # Run backend tests
        $backendSuccess = Run-Command -Name "Backend" -Command { python -m pytest }
        if (-not $backendSuccess) { $success = $false }
    } else {
        Write-Host "Skipping backend tests due to dependency installation failure" -ForegroundColor Red
        $success = $false
    }
} finally {
    # Return to original directory
    Pop-Location
}

# Display summary
Write-Host "\n===== Test Summary =====\n" -ForegroundColor Cyan

# Check test results
if ($frontendSuccess -and $backendSuccess) {
    Write-Host "All tests passed successfully!" -ForegroundColor Green
    exit 0
} else {
    if ($frontendSuccess) {
        Write-Host "Frontend tests passed successfully." -ForegroundColor Green
    } else {
        Write-Host "Frontend tests failed. Please check the logs above for details." -ForegroundColor Red
    }
    
    if ($backendSuccess) {
        Write-Host "Backend tests passed successfully." -ForegroundColor Green
    } else {
        Write-Host "Backend tests failed. Please check the logs above for details." -ForegroundColor Red
    }
    
    exit 1
}