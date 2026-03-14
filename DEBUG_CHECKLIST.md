# 🔍 DEBUG CHECKLIST - What to Check

## ⚠️ If Nothing Works, Check These:

### 1. **Are Both Servers Running?**

Check in your terminal:
- **Backend**: Should show "Server running on port 5000"
- **Frontend**: Should show "Local: http://localhost:3000"

If not running:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

### 2. **Can You Access the Login Page?**

Open browser: http://localhost:3000

**What you should see**:
- Login page with two tabs: "Student Login" and "Admin Login"
- Email and password fields
- Login button

**If you see blank page**:
- Open browser console (F12)
- Check for errors
- Look at Network tab

---

### 3. **Test Admin Login**

1. Go to http://localhost:3000
2. Click "Admin Login" tab
3. Enter:
   - Email: `admin@university.edu`
   - Password: `admin123`
4. Click "Login"

**What should happen**:
- URL changes to http://localhost:3000/admin
- You see "Admin Dashboard" page
- Navbar shows: Dashboard, Courses, Preferences, Reports

**If login fails**:
- Open browser console (F12)
- Look for error messages
- Check Network tab → Look for /api/auth/admin/login request
- Check if it returns 200 or error

---

### 4. **Test Student Login**

1. Go to http://localhost:3000
2. Click "Student Login" tab
3. Enter:
   - Email: `alice@student.edu`
   - Password: `student123`
4. Click "Login"

**What should happen**:
- URL changes to http://localhost:3000/student
- You see "Student Dashboard" page
- Navbar shows: Dashboard, Courses, Preferences, Results

**If login fails**:
- Same debugging steps as admin login

---

### 5. **Check Backend API**

Open a new terminal and test:

```bash
# Test if backend is responding
curl http://localhost:5000/api/courses

# Or in PowerShell
Invoke-WebRequest http://localhost:5000/api/courses
```

**Expected**: Should return JSON with courses

**If error**: Backend is not running or has issues

---

### 6. **Check Browser Console**

1. Open browser (Chrome/Edge/Firefox)
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Look for red error messages

**Common errors and fixes**:

- **"Failed to fetch"** → Backend not running
- **"Network Error"** → Wrong API URL
- **"401 Unauthorized"** → Token issue
- **"404 Not Found"** → Wrong route

---

### 7. **Check Network Requests**

1. Open browser Developer Tools (F12)
2. Go to "Network" tab
3. Try to login or navigate
4. Watch the requests

**What to look for**:
- `/api/auth/student/login` → Should return 200
- `/api/courses` → Should return 200
- `/api/preferences` → Should return 200

**If you see red (failed requests)**:
- Click on the request
- Check "Response" tab
- Read the error message

---

### 8. **Verify Database Has Data**

Run this in backend folder:

```bash
cd backend
node -e "const db = require('./src/config/db'); db.query('SELECT COUNT(*) as count FROM courses', []).then(r => console.log('Courses:', r.rows || r))"
```

**Expected**: Should show count > 0

**If 0 courses**:
- Database not initialized
- Restart backend

---

### 9. **Check Specific Features**

#### Can't See Courses (Student):
1. Login as student
2. Click "Courses" in navbar
3. Open browser console (F12)
4. Check Network tab for `/api/courses` request
5. If request fails → Backend issue
6. If request succeeds but no courses → Frontend rendering issue

#### Can't Submit Preferences:
1. Login as student
2. Go to Preferences
3. Try to add a course
4. Open browser console
5. Look for errors
6. Check if courses are loading in left panel

#### Can't See Student Preferences (Admin):
1. Login as admin
2. Click "Preferences" in navbar
3. Check if page loads
4. Open browser console
5. Check Network tab for `/api/reports/preferences`
6. If 404 → Route not registered
7. If 500 → Backend error

---

### 10. **Backend Logs**

Look at your backend terminal for errors:

**Good logs**:
```
✓ SQLite database connected successfully
✓ Database schema initialized
✓ Sample data already exists
2026-03-13T15:46:11.915Z - GET /api/courses
```

**Bad logs**:
```
Error: ECONNREFUSED
Error: Cannot find module
Error: Database error
```

---

## 🔧 QUICK FIXES

### Fix 1: Restart Everything
```bash
# Stop both servers (Ctrl+C)
# Then restart:

# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm run dev
```

### Fix 2: Clear Browser Cache
1. Open browser
2. Press Ctrl+Shift+Delete
3. Clear cache and cookies
4. Reload page

### Fix 3: Check .env File
```bash
cd backend
cat .env
```

Should contain:
```
USE_SQLITE=true
JWT_SECRET=your-secret-key-here
PORT=5000
```

### Fix 4: Reinstall Dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

---

## 📋 SYSTEMATIC TEST

Follow this exact sequence:

1. ✅ Backend running? → Check terminal
2. ✅ Frontend running? → Check terminal
3. ✅ Can open http://localhost:3000? → Check browser
4. ✅ Can see login page? → Check browser
5. ✅ Can login as admin? → Try login
6. ✅ Can see admin dashboard? → Check URL
7. ✅ Can see courses page? → Click Courses
8. ✅ Can add course? → Try adding
9. ✅ Can logout? → Click logout
10. ✅ Can login as student? → Try login
11. ✅ Can see student dashboard? → Check URL
12. ✅ Can see courses? → Click Courses
13. ✅ Can see preferences page? → Click Preferences
14. ✅ Can add courses to preferences? → Try adding
15. ✅ Can submit preferences? → Try submitting

**Stop at the first step that fails and report exactly what you see!**

---

## 🚨 REPORT FORMAT

If something doesn't work, tell me:

1. **Which step failed?** (e.g., "Step 5: Can't see courses")
2. **What did you see?** (e.g., "Blank page", "Error message", "Loading forever")
3. **Browser console errors?** (F12 → Console → Copy error messages)
4. **Network errors?** (F12 → Network → Which request failed?)
5. **Backend logs?** (Copy last 10 lines from backend terminal)

---

## 📸 SCREENSHOTS TO TAKE

If nothing works, take screenshots of:

1. Login page
2. Browser console (F12 → Console)
3. Network tab (F12 → Network)
4. Backend terminal
5. Frontend terminal

---

## ✅ WORKING SYSTEM LOOKS LIKE

### Login Page:
- Two tabs: Student Login, Admin Login
- Email and password fields
- Login button
- No errors in console

### Admin Dashboard:
- URL: http://localhost:3000/admin
- Shows statistics cards
- "Run Allocation Algorithm" button
- Navbar with links

### Student Dashboard:
- URL: http://localhost:3000/student
- Shows statistics cards
- Quick action buttons
- Navbar with links

### Courses Page (Student):
- Shows list of courses
- Search bar works
- Filter dropdown works
- Course cards display properly

### Preferences Page (Student):
- Left panel: Available courses
- Right panel: Selected courses
- Can add courses
- Can drag to reorder
- Submit button works

### Preferences Page (Admin):
- Shows list of students
- Each student card shows their preferences
- Can filter students
- Statistics at top

---

**Follow this checklist step by step and tell me exactly where it fails!**
