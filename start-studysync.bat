@echo off
echo Starting StudySync Application...
echo.
echo Application will run on: http://localhost:5000
echo.
echo Building frontend and starting production server...
echo.

cd /d "C:\Users\Dhruv choudhary\Desktop\DevOps Project\studysync"

echo Building frontend...
cd frontend && npm run build && cd ..

echo Starting production server...
start "StudySync Production" cmd /k "cd backend && npm start"

echo.
echo StudySync is starting on: http://localhost:5000
echo.
echo Press any key to continue...
pause >nul