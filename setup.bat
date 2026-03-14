@echo off
echo ========================================
echo Course Allocation System - Setup Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js: OK

echo.
echo ========================================
echo Installing Backend Dependencies...
echo ========================================
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)

echo.
echo Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created. Please edit it with your database credentials.
)

cd ..

echo.
echo ========================================
echo Installing Frontend Dependencies...
echo ========================================
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo IMPORTANT: Before running the application:
echo 1. Install PostgreSQL from https://www.postgresql.org/download/windows/
echo 2. Create database: createdb course_allocation
echo 3. Import schema: psql -U postgres -d course_allocation -f database/schema.sql
echo 4. Edit backend/.env with your database password
echo.
echo Then run: start.bat
echo.
pause
