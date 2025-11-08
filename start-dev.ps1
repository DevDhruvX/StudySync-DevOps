# start-dev.ps1 - Start StudySync in development mode

Write-Host "🚀 Starting StudySync in Development Mode..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "📂 Project directory: $scriptPath" -ForegroundColor Blue
Write-Host ""

# Start backend server in new window
Write-Host "🔧 Starting Backend Server (MongoDB + Express)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; Write-Host '🔗 Backend Server starting on http://localhost:5000' -ForegroundColor Yellow; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend server in new window  
Write-Host "🎨 Starting Frontend Server (React + Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; Write-Host '🌐 Frontend Server starting on http://localhost:5173' -ForegroundColor Yellow; npm run dev"

Write-Host ""
Write-Host "✅ Both development servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Backend API:     http://localhost:5000" -ForegroundColor Yellow
Write-Host "🌐 Frontend App:    http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Backend runs on port 5000 (API endpoints)" -ForegroundColor White
Write-Host "   - Frontend runs on port 5173 (React app)" -ForegroundColor White
Write-Host "   - Both servers auto-reload on file changes" -ForegroundColor White
Write-Host "   - Check both terminal windows for logs" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")