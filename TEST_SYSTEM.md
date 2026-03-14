# 🧪 SYSTEM TEST GUIDE

## ✅ Backend is Running
- Server: http://localhost:5000
- Database: SQLite ✅
- Sample data loaded ✅

## ✅ Frontend is Running
- App: http://localhost:3000
- React + Vite ✅

---

## 🔑 TEST CREDENTIALS

### Admin Account:
- **Email**: `admin@university.edu`
- **Password**: `admin123`

### Student Accounts:
- **Alice**: `alice@student.edu` / `student123`
- **Bob**: `bob@student.edu` / `student123`
- **Carol**: `carol@student.edu` / `student123`

---

## 📋 STEP-BY-STEP TEST

### ✅ TEST 1: Admin Login & View Courses

1. Open http://localhost:3000
2. Click "Admin Login" tab
3. Enter:
   - Email: `admin@university.edu`
   - Password: `admin123`
4. Click "Login"
5. **Expected**: Redirected to Admin Dashboard
6. Click "Courses" in navbar
7. **Expected**: See list of courses (CS101, CS201, CS301, etc.)

---

### ✅ TEST 2: Admin Add New Course

1. On Courses page, click "Add New Course" button
2. Fill in the form:
   - **Course Code**: `CS401`
   - **Course Name**: `Advanced Algorithms`
   - **Department**: `Computer Science`
   - **Instructor**: `Dr. Anderson`
   - **Time Slot**: `Mon/Wed 10:00-11:30`
   - **Seat Capacity**: `30`
   - **Description**: `Advanced algorithm design`
3. Click "Add Course"
4. **Expected**: Success message + course appears in list

---

### ✅ TEST 3: Student Login & Browse Courses

1. Click logout (top right)
2. Click "Student Login" tab
3. Enter:
   - Email: `alice@student.edu`
   - Password: `student123`
4. Click "Login"
5. **Expected**: Redirected to Student Dashboard
6. Click "Courses" in navbar
7. **Expected**: See ALL courses including CS401 you just added
8. Try searching for "CS401"
9. **Expected**: Course appears in search results

---

### ✅ TEST 4: Student Submit Preferences

1. Click "Preferences" in navbar
2. **Left Panel**: Available Courses
   - You should see all courses
   - Search for courses if needed
3. **Add Courses**:
   - Click "Add" button on CS401
   - Click "Add" button on CS201
   - Click "Add" button on CS301
4. **Right Panel**: Your Preferences
   - You should see 3 courses with rank numbers (1, 2, 3)
5. **Reorder** (try both methods):
   - Method 1: Drag CS301 to top position
   - Method 2: Use arrow buttons to move courses
6. Click "Submit Preferences" button
7. **Expected**: Green success message "✅ Preferences submitted successfully!"

---

### ✅ TEST 5: Admin View Student Preferences

1. Logout
2. Login as admin: `admin@university.edu` / `admin123`
3. Click "Preferences" in navbar (NEW!)
4. **Expected**: See page titled "Student Preferences"
5. **Expected**: See Alice Johnson's card with:
   - Name: Alice Johnson
   - Email: alice@student.edu
   - Department: Computer Science
   - GPA: 3.8
   - Her 3 ranked course choices
6. **Verify**: Courses are in the order Alice ranked them

---

### ✅ TEST 6: Admin Run Allocation

1. Click "Dashboard" in navbar
2. Find "Run Allocation Algorithm" button (green button)
3. Click the button
4. Confirm the action
5. **Expected**: 
   - Spinner appears
   - After few seconds: "✅ Allocation completed successfully!"
6. **Expected**: Dashboard stats update

---

### ✅ TEST 7: Student View Results

1. Logout
2. Login as student: `alice@student.edu` / `student123`
3. Click "Results" in navbar
4. **Expected**: See "Your Allocated Courses" page
5. **Expected**: See courses that were allocated to Alice
6. **Expected**: Each course shows:
   - Course code and name
   - Instructor
   - Time slot
   - Department
7. Try clicking "Download Schedule" button

---

## 🐛 TROUBLESHOOTING

### Issue: Can't login
**Solution**: 
- Make sure backend is running (check http://localhost:5000)
- Check browser console for errors (F12)
- Verify credentials are correct

### Issue: Courses not showing
**Solution**:
- Check backend logs for errors
- Verify database has courses (see database check below)
- Check browser network tab (F12 → Network)

### Issue: Preferences not submitting
**Solution**:
- Check browser console for errors
- Verify you selected at least one course
- Check backend logs

### Issue: Allocation not working
**Solution**:
- Make sure students have submitted preferences
- Check backend logs for errors
- Verify courses have available seats

---

## 🔍 DATABASE CHECKS

### Check if courses exist:
```bash
cd backend
node -e "const db = require('./src/config/db'); db.query('SELECT course_code, course_name FROM courses', []).then(r => console.log(r.rows || r))"
```

### Check if students exist:
```bash
cd backend
node -e "const db = require('./src/config/db'); db.query('SELECT name, email FROM students', []).then(r => console.log(r.rows || r))"
```

### Check preferences:
```bash
cd backend
node -e "const db = require('./src/config/db'); db.query('SELECT * FROM preferences', []).then(r => console.log(r.rows || r))"
```

### Check enrollments:
```bash
cd backend
node -e "const db = require('./src/config/db'); db.query('SELECT * FROM enrollments', []).then(r => console.log(r.rows || r))"
```

---

## 📊 EXPECTED RESULTS

### After Admin Adds Course:
- ✅ Course appears in admin course list
- ✅ Course appears in student course catalog
- ✅ Course has 0 enrolled students

### After Student Submits Preferences:
- ✅ Success message appears
- ✅ Preferences saved to database
- ✅ Admin can see preferences in Preferences page

### After Admin Runs Allocation:
- ✅ Success message appears
- ✅ Enrollments created in database
- ✅ Course enrolled_count updated
- ✅ Students can see results

---

## ✅ VERIFICATION CHECKLIST

- [ ] Admin can login
- [ ] Admin can add courses
- [ ] Admin can view courses
- [ ] Student can login
- [ ] Student can see ALL courses (including admin-added)
- [ ] Student can search/filter courses
- [ ] Student can add courses to preferences
- [ ] Student can drag to reorder preferences
- [ ] Student can submit preferences
- [ ] Admin can view student preferences (NEW!)
- [ ] Admin can run allocation
- [ ] Student can view allocation results

---

## 🎯 WHAT TO LOOK FOR

### In Course Catalog (Student):
- All courses should be visible
- Search should work
- Filter by department should work
- Seat availability should show
- Course details should display

### In Preferences (Student):
- Left panel shows available courses
- Right panel shows selected courses with ranks
- Drag & drop should work
- Arrow buttons should work
- Submit button should work
- Success message should appear

### In Preferences Page (Admin):
- Should see all students who submitted
- Each student card shows their info
- Ranked courses displayed correctly
- Can filter by student/department
- Statistics show correct numbers

### In Results (Student):
- Allocated courses should display
- Course details should be complete
- Download button should work

---

## 🚨 COMMON ISSUES & FIXES

### 1. "Failed to fetch" errors
- **Cause**: Backend not running
- **Fix**: Check if backend is on port 5000

### 2. Empty course list
- **Cause**: Database not initialized
- **Fix**: Restart backend, it will create sample data

### 3. Login fails
- **Cause**: Wrong credentials or backend issue
- **Fix**: Use exact credentials listed above

### 4. Preferences not saving
- **Cause**: Database connection issue
- **Fix**: Check backend logs, restart if needed

### 5. Allocation not working
- **Cause**: No preferences submitted
- **Fix**: Make sure at least one student submitted preferences

---

## 📝 TEST NOTES

Write down what you see at each step:

**Test 1 (Admin Login)**:
- [ ] Logged in successfully
- [ ] Saw dashboard
- [ ] Saw courses list
- Notes: _______________

**Test 2 (Add Course)**:
- [ ] Form appeared
- [ ] Course added
- [ ] Course in list
- Notes: _______________

**Test 3 (Student Browse)**:
- [ ] Logged in
- [ ] Saw courses
- [ ] Saw CS401
- Notes: _______________

**Test 4 (Submit Preferences)**:
- [ ] Added courses
- [ ] Reordered them
- [ ] Submitted successfully
- Notes: _______________

**Test 5 (Admin View Preferences)**:
- [ ] Saw preferences page
- [ ] Saw Alice's submission
- [ ] Courses ranked correctly
- Notes: _______________

**Test 6 (Run Allocation)**:
- [ ] Button clicked
- [ ] Success message
- [ ] Stats updated
- Notes: _______________

**Test 7 (View Results)**:
- [ ] Saw results page
- [ ] Courses allocated
- [ ] Details correct
- Notes: _______________

---

## 🎉 SUCCESS CRITERIA

All tests should pass with:
- ✅ No errors in browser console
- ✅ No errors in backend logs
- ✅ All features working as described
- ✅ Data persisting correctly
- ✅ UI responding properly

---

**If any test fails, note exactly what happened and at which step!**
