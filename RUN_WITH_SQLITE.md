# Run with SQLite (No PostgreSQL Required!)

## Quick Start - 2 Commands Only!

Since PostgreSQL is not installed, you can run the system with SQLite instead:

### Step 1: Install SQLite Package

```cmd
cd backend
npm install sqlite3
cd ..
```

### Step 2: Start the Application

```cmd
start-sqlite.bat
```

That's it! The application will:
- ✅ Create SQLite database automatically
- ✅ Initialize schema
- ✅ Insert sample data
- ✅ Start backend server
- ✅ Start frontend server

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## Demo Credentials

**Note**: The sample passwords are placeholders. You need to generate real hashes:

```cmd
cd backend
node generate-passwords.js
```

Then the credentials will be:
- **Student**: alice@student.edu / student123
- **Admin**: admin@university.edu / admin123

## Advantages of SQLite

- ✅ No separate database installation
- ✅ Single file database
- ✅ Perfect for development/testing
- ✅ Zero configuration
- ✅ Portable

## Database Location

The SQLite database file is created at:
```
backend/course_allocation.db
```

## Switching Back to PostgreSQL

If you later install PostgreSQL, just:
1. Install PostgreSQL
2. Run the original `start.bat`
3. The system will use PostgreSQL instead

## Limitations

SQLite is great for development but for production:
- Use PostgreSQL for better concurrency
- Better performance with many users
- Advanced features and scalability

---

**Ready to run? Execute: `start-sqlite.bat`** 🚀
