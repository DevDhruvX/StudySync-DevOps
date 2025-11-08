@echo off
title StudySync Development Startup
color 0A

echo.
echo ==========================================
echo     🚀 StudySync Development Mode
echo ==========================================
echo.

cd /d "C:\Users\Dhruv choudhary\Desktop\DevOps Project\studysync"

echo 🔧 Starting Backend Server (Express + MongoDB)...
start "StudySync Backend" cmd /k "cd backend && echo Backend API: http://localhost:5000 && npm run dev"

echo.
echo ⏳ Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo 🎨 Starting Frontend Server (React + Vite)...
start "StudySync Frontend" cmd /k "cd frontend && echo Frontend App: http://localhost:5173 && npm run dev"

echo.
echo ✅ Both development servers are starting!
echo.
echo 🔗 Backend API:     http://localhost:5000
echo 🌐 Frontend App:    http://localhost:5173
echo.
echo 💡 Tips:
echo    - Backend runs on port 5000 (API endpoints)
echo    - Frontend runs on port 5173 (React app)  
echo    - Both servers auto-reload on file changes
echo    - Check both terminal windows for logs
echo.
echo Press any key to continue...
pause >nul