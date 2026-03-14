# Quick Start Guide

Get the Course Allocation System running in 5 minutes!

## Prerequisites

- Node.js v16+
- PostgreSQL v12+
- npm

## Quick Setup

### 1. Database Setup (2 minutes)

```bash
# Create database
createdb course_allocation

# Import schema
psql -U postgres -d course_allocation -f database/schema.sql
```

### 2. Backend Setup (1 minute)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your DB_PASSWORD and JWT_SECRET
npm start
```

### 3. Frontend Setup (1 minute)

```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application (1 minute)

Open http://localhost:3000

**Login Credentials:**
- Student: `alice@student.edu` / `student123`
- Admin: `admin@university.edu` / `admin123`

## Test the System

### As Student:
1. Login → Browse Courses → Submit Preferences → View Results

### As Admin:
1. Login → Manage Courses → Run Allocation → View Reports

## Common Issues

**Database connection failed?**
```bash
# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql # macOS
```

**Port already in use?**
```bash
# Change PORT in backend/.env
PORT=5001
```

**Password hash issues?**
```bash
cd backend
node create-admin.js
# Copy the generated hashes to your database
```

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for troubleshooting
- Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details

## Architecture Overview

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│   Express   │─────▶│ PostgreSQL  │
│  Frontend   │◀─────│   Backend   │◀─────│  Database   │
│  (Port 3000)│      │  (Port 5000)│      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

## Key Features

✅ Student preference submission with drag & drop
✅ Automated allocation algorithm
✅ Admin dashboard with analytics
✅ Course management (CRUD)
✅ Comprehensive reports
✅ JWT authentication
✅ Role-based access control

## Demo Workflow

1. **Student submits preferences** (ranked 1-10)
2. **Admin runs allocation algorithm**
3. **System allocates courses** based on:
   - Student GPA priority
   - Preference ranking
   - Seat availability
   - Prerequisites
   - Time conflicts
4. **Students view results**
5. **Admin reviews reports**

## Support

Need help? Check:
- Console logs for errors
- Database connection settings
- Port availability
- Environment variables

---

**Ready to go? Start with Step 1! 🚀**
