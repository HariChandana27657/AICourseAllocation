# Complete Setup Guide

## Step-by-Step Installation Instructions

### Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v16+ installed (`node --version`)
- ✅ PostgreSQL v12+ installed (`psql --version`)
- ✅ npm or yarn installed (`npm --version`)

### Step 1: PostgreSQL Database Setup

#### Windows:
```cmd
# Start PostgreSQL service
net start postgresql-x64-14

# Create database using psql
psql -U postgres
```

#### macOS/Linux:
```bash
# Start PostgreSQL
sudo service postgresql start

# Or using Homebrew on macOS
brew services start postgresql

# Create database
psql -U postgres
```

#### In psql console:
```sql
CREATE DATABASE course_allocation;
\c course_allocation
\i database/schema.sql
\q
```

### Step 2: Backend Configuration

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Edit `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=course_allocation
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
JWT_SECRET=your_random_secret_key_min_32_chars
NODE_ENV=development
```

#### Generate JWT Secret:
```bash
# On Linux/macOS
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Step 3: Create Admin User

Since passwords are hashed, you need to create an admin user:

```bash
# Install bcrypt globally
npm install -g bcrypt-cli

# Generate password hash
bcrypt-cli hash admin123 10
```

Or use Node.js:
```javascript
// create-admin.js
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10, (err, hash) => {
  console.log('Hash:', hash);
});
```

Run:
```bash
node create-admin.js
```

Update the admin password hash in `database/schema.sql` or insert directly:
```sql
UPDATE admins SET password_hash = 'YOUR_GENERATED_HASH' WHERE email = 'admin@university.edu';
```

### Step 4: Create Student Users

Similarly, create student password hashes and update:
```sql
UPDATE students SET password_hash = 'YOUR_GENERATED_HASH' WHERE email = 'alice@student.edu';
```

### Step 5: Frontend Configuration

```bash
cd frontend

# Install dependencies
npm install

# Optional: Create .env for custom API URL
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Step 6: Start the Application

#### Terminal 1 - Backend:
```bash
cd backend
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║   Course Allocation System - Backend Server               ║
║   Server running on port 5000                              ║
║   Environment: development                                 ║
╚════════════════════════════════════════════════════════════╝
✓ Database connected successfully
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 7: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health

### Step 8: Test the System

1. **Login as Admin**:
   - Email: `admin@university.edu`
   - Password: `admin123`

2. **Create/Verify Courses**:
   - Navigate to Course Management
   - Verify sample courses are loaded

3. **Login as Student**:
   - Email: `alice@student.edu`
   - Password: `student123`

4. **Submit Preferences**:
   - Browse courses
   - Add courses to preferences
   - Rank them using drag & drop
   - Submit preferences

5. **Run Allocation** (as Admin):
   - Go to Admin Dashboard
   - Click "Run Allocation Algorithm"
   - View results in Reports

6. **View Results** (as Student):
   - Navigate to Allocation Results
   - See allocated courses

## Troubleshooting

### Database Connection Issues

**Error**: `ECONNREFUSED` or `Connection refused`

**Solution**:
```bash
# Check if PostgreSQL is running
# Windows
sc query postgresql-x64-14

# macOS/Linux
sudo service postgresql status

# Start if not running
sudo service postgresql start
```

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
```bash
# Find process using port
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000

# Kill the process or change PORT in .env
```

### JWT Token Issues

**Error**: `Invalid or expired token`

**Solution**:
- Clear browser localStorage
- Login again
- Ensure JWT_SECRET is set in .env

### Database Schema Issues

**Error**: `relation "students" does not exist`

**Solution**:
```bash
# Re-run schema
psql -U postgres -d course_allocation -f database/schema.sql
```

### CORS Issues

**Error**: `CORS policy blocked`

**Solution**:
- Ensure backend is running on port 5000
- Check Vite proxy configuration in `vite.config.ts`
- Restart both servers

### Password Hash Issues

**Error**: `Invalid credentials` even with correct password

**Solution**:
- Regenerate password hashes using bcrypt
- Update database with new hashes
- Ensure bcrypt rounds match (10 rounds)

## Production Deployment

### Environment Variables

Update `.env` for production:
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=strong-production-password
JWT_SECRET=strong-random-secret-key
```

### Build Frontend

```bash
cd frontend
npm run build
```

Serve the `dist` folder using:
- Nginx
- Apache
- Vercel
- Netlify

### Deploy Backend

Options:
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

### Database

Use managed PostgreSQL:
- AWS RDS
- Heroku Postgres
- DigitalOcean Managed Database
- Supabase

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable database SSL
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Enable security headers
- [ ] Regular security updates

## Performance Optimization

- [ ] Add database indexes
- [ ] Implement caching (Redis)
- [ ] Enable gzip compression
- [ ] Optimize SQL queries
- [ ] Add pagination for large datasets
- [ ] Use connection pooling
- [ ] Implement CDN for static assets
- [ ] Add monitoring (PM2, New Relic)

## Backup Strategy

```bash
# Backup database
pg_dump -U postgres course_allocation > backup.sql

# Restore database
psql -U postgres course_allocation < backup.sql
```

## Support

For additional help:
1. Check the main README.md
2. Review API documentation
3. Check console logs for errors
4. Open an issue on GitHub

---

**Happy Coding! 🚀**
