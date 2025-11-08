# start-studysync.ps1 - Start StudySync production server

Write-Host "🚀 Starting StudySync Application..." -ForegroundColor Green
Write-Host ""
Write-Host "📡 Application will run on: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "📂 Current directory: $scriptPath" -ForegroundColor Blue

# Build frontend first
Write-Host "🔧 Building frontend..." -ForegroundColor Cyan
Set-Location "$scriptPath\frontend"
npm run build

# Start production server
Write-Host "🚀 Starting production server..." -ForegroundColor Cyan
Set-Location "$scriptPath\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; npm start"

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "🌐 Backend API: http://localhost:5000" -ForegroundColor Yellow
Write-Host "🎯 Frontend App: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")