@echo off
echo ========================================
echo Course Allocation System (SQLite Mode)
echo ========================================
echo.

echo Installing SQLite package...
cd backend
call npm install sqlite3 --save
if %errorlevel% neq 0 (
    echo ERROR: Failed to install sqlite3
    pause
    exit /b 1
)

echo.
echo Updating configuration for SQLite...
echo USE_SQLITE=true >> .env

cd ..

echo.
echo Starting Backend Server (SQLite)...
start "Backend Server" cmd /k "cd backend && set USE_SQLITE=true && npm start"

timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo Database: SQLite (backend/course_allocation.db)
echo.
echo IMPORTANT: Generate password hashes first!
echo Run: cd backend && node generate-passwords.js
echo.
echo Press any key to stop all servers...
pause >nul

echo Stopping servers...
taskkill /FI "WindowTitle eq Backend Server*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Frontend Server*" /T /F >nul 2>&1

echo Servers stopped.
