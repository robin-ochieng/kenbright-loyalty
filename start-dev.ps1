# Kenbright 360 Development Startup Script
# This script starts both the backend and frontend-user applications

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kenbright 360 Development Startup    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location "$root\backend"
    & "$root\.venv\Scripts\Activate.ps1"
    python run.py
} -ArgumentList $projectRoot

Write-Host "Backend started with Job ID: $($backendJob.Id)" -ForegroundColor Yellow

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend User
Write-Host "Starting Frontend User Portal..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location "$root\frontend-user"
    npm run dev
} -ArgumentList $projectRoot

Write-Host "Frontend started with Job ID: $($frontendJob.Id)" -ForegroundColor Yellow

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Both services are starting...        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API:    http://localhost:8000" -ForegroundColor White
Write-Host "Frontend User:  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Magenta
Write-Host ""

# Function to cleanup jobs on exit
$cleanup = {
    Write-Host ""
    Write-Host "Stopping all services..." -ForegroundColor Red
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "All services stopped." -ForegroundColor Green
}

# Register cleanup on script termination
Register-EngineEvent PowerShell.Exiting -Action $cleanup | Out-Null

try {
    # Monitor and display output from both jobs
    while ($true) {
        # Check if jobs are still running
        $backendState = (Get-Job -Id $backendJob.Id).State
        $frontendState = (Get-Job -Id $frontendJob.Id).State

        # Receive and display any output
        Receive-Job -Id $backendJob.Id -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "[Backend] $_" -ForegroundColor Blue
        }
        Receive-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "[Frontend] $_" -ForegroundColor Magenta
        }

        # Check for job failures
        if ($backendState -eq "Failed") {
            Write-Host "Backend job failed!" -ForegroundColor Red
            Receive-Job -Id $backendJob.Id
        }
        if ($frontendState -eq "Failed") {
            Write-Host "Frontend job failed!" -ForegroundColor Red
            Receive-Job -Id $frontendJob.Id
        }

        Start-Sleep -Seconds 1
    }
}
finally {
    & $cleanup
}
