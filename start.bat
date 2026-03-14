@echo off
echo ========================================
echo Starting Course Allocation System
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all servers...
pause >nul

echo Stopping servers...
taskkill /FI "WindowTitle eq Backend Server*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Frontend Server*" /T /F >nul 2>&1

echo Servers stopped.
