# Windows Setup Guide

## Current Status ✅

- ✅ Node.js v22.19.0 installed
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed
- ✅ .env file created
- ⚠️ PostgreSQL needs to be installed

## Quick Start (3 Steps)

### Step 1: Install PostgreSQL

**Option A: Download Installer (Recommended)**
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Set password: `postgres` (or remember your password)
   - Port: `5432` (default)
   - Install pgAdmin 4 (optional GUI tool)

**Option B: Using Chocolatey**
```powershell
choco install postgresql
```

**Option C: Using Scoop**
```powershell
scoop install postgresql
```

### Step 2: Setup Database

Open Command Prompt or PowerShell as Administrator:

```cmd
# Add PostgreSQL to PATH (if not already)
# Default location: C:\Program Files\PostgreSQL\16\bin

# Create database
createdb -U postgres course_allocation

# Import schema
psql -U postgres -d course_allocation -f database\schema.sql
```

If prompted for password, enter the password you set during PostgreSQL installation.

### Step 3: Start the Application

**Option A: Using Batch Script**
```cmd
start.bat
```

**Option B: Manual Start**

Terminal 1 (Backend):
```cmd
cd backend
npm start
```

Terminal 2 (Frontend):
```cmd
cd frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Demo Credentials

### Student Login
- Email: `alice@student.edu`
- Password: `student123`

### Admin Login
- Email: `admin@university.edu`
- Password: `admin123`

**Note**: You'll need to generate proper password hashes first!

## Generate Password Hashes

Since the sample data has placeholder hashes, you need to generate real ones:

```cmd
cd backend
node create-admin.js
```

Copy the generated hashes and update your database:

```sql
-- Connect to database
psql -U postgres -d course_allocation

-- Update admin password
UPDATE admins SET password_hash = 'YOUR_GENERATED_HASH' WHERE email = 'admin@university.edu';

-- Update student password
UPDATE students SET password_hash = 'YOUR_GENERATED_HASH' WHERE email = 'alice@student.edu';

-- Exit
\q
```

## Troubleshooting

### PostgreSQL Not Found

**Error**: `'psql' is not recognized`

**Solution**:
1. Find PostgreSQL installation directory (usually `C:\Program Files\PostgreSQL\16\bin`)
2. Add to PATH:
   - Right-click "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Edit "Path" variable
   - Add PostgreSQL bin directory
   - Restart Command Prompt

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Database Connection Failed

**Error**: `ECONNREFUSED` or `Connection refused`

**Solution**:
1. Check if PostgreSQL is running:
   ```cmd
   # Check service status
   sc query postgresql-x64-16
   
   # Start service if stopped
   net start postgresql-x64-16
   ```

2. Verify credentials in `backend/.env`:
   - DB_PASSWORD should match your PostgreSQL password
   - DB_USER is usually `postgres`
   - DB_NAME is `course_allocation`

### Password Authentication Failed

**Error**: `password authentication failed for user "postgres"`

**Solution**:
1. Update password in `backend/.env`
2. Or reset PostgreSQL password:
   ```cmd
   psql -U postgres
   ALTER USER postgres PASSWORD 'newpassword';
   \q
   ```

## Alternative: SQLite Setup (No PostgreSQL Required)

If you want to avoid PostgreSQL installation, I can convert the system to use SQLite instead. Let me know!

## Verify Installation

Run these commands to verify everything is set up:

```cmd
# Check Node.js
node --version

# Check npm
npm --version

# Check PostgreSQL
psql --version

# Check if database exists
psql -U postgres -l | findstr course_allocation
```

## Next Steps

1. ✅ Install PostgreSQL
2. ✅ Create database and import schema
3. ✅ Generate password hashes
4. ✅ Update database with hashes
5. ✅ Run `start.bat`
6. ✅ Open http://localhost:3000
7. ✅ Login and test the system

## Need Help?

- Check console logs for errors
- Review `SETUP_GUIDE.md` for detailed instructions
- Check `TESTING_GUIDE.md` for testing procedures
- Review `API_DOCUMENTATION.md` for API details

---

**Current Directory Structure:**
```
course-allocation-system/
├── backend/          ✅ Dependencies installed
├── frontend/         ✅ Dependencies installed
├── database/         ✅ Schema ready
├── setup.bat         ✅ Setup script
├── start.bat         ✅ Start script
└── .env             ✅ Configuration file
```

**Status**: Ready to run after PostgreSQL installation! 🚀
