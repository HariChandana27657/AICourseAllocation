# 🚀 QUICK START GUIDE

## ✅ System is Ready!

Both servers are running:
- **Backend**: http://localhost:5000 ✅
- **Frontend**: http://localhost:3000 ✅

---

## 🎯 Test the Complete Workflow (5 Minutes)

### **Step 1: Admin Adds Courses** (1 min)

1. Open http://localhost:3000
2. Login: `admin@university.edu` / `admin123`
3. Click **"Courses"** in navbar
4. Click **"Add New Course"**
5. Add a course:
   - Code: `CS401`
   - Name: `Advanced Algorithms`
   - Department: `Computer Science`
   - Instructor: `Dr. Smith`
   - Time: `Mon/Wed 10:00-11:30`
   - Seats: `30`
6. Click **"Add Course"**
7. ✅ Course created!

---

### **Step 2: Student Submits Preferences** (2 min)

1. Logout (top right)
2. Login: `alice@student.edu` / `student123`
3. Click **"Courses"** in navbar
4. ✅ **Verify you see CS401** (and other courses)
5. Click **"Preferences"** in navbar
6. **Add courses** from left panel (click "Add" button)
7. **Drag courses** to reorder them (or use arrow buttons)
8. Click **"Submit Preferences"**
9. ✅ Success message appears!

---

### **Step 3: Admin Views Submissions** (1 min)

1. Logout
2. Login as admin: `admin@university.edu` / `admin123`
3. Click **"Preferences"** in navbar (NEW!)
4. ✅ **See Alice's preferences** with rankings!
5. View her course choices and details

---

### **Step 4: Run Allocation** (30 sec)

1. Click **"Dashboard"** in navbar
2. Click **"Run Allocation Algorithm"**
3. Confirm
4. ✅ Wait for success message

---

### **Step 5: Student Views Results** (30 sec)

1. Logout
2. Login as student: `alice@student.edu` / `student123`
3. Click **"Results"** in navbar
4. ✅ **See allocated courses!**
5. Click **"Download Schedule"**

---

## 🎉 DONE!

**Complete workflow tested in 5 minutes!**

---

## 📋 What You Just Tested

✅ Admin can add courses
✅ Student can see admin-added courses
✅ Student can submit ranked preferences
✅ Admin can view student submissions
✅ Admin can run allocation
✅ Student can view results

---

## 🔑 Test Credentials

### Admin:
- Email: `admin@university.edu`
- Password: `admin123`

### Students:
- `alice@student.edu` / `student123`
- `bob@student.edu` / `student123`
- `charlie@student.edu` / `student123`

---

## 📱 Key Pages

### For Students:
- `/student` - Dashboard
- `/student/courses` - Browse courses ✅
- `/student/preferences` - Submit preferences ✅
- `/student/results` - View results ✅

### For Admin:
- `/admin` - Dashboard
- `/admin/courses` - Manage courses ✅
- `/admin/preferences` - View student submissions ✅ **NEW!**
- `/admin/reports` - Analytics ✅

---

## 💡 Tips

1. **Add multiple courses** as admin for better testing
2. **Test with multiple students** to see allocation priority
3. **Check the Preferences page** as admin to verify submissions
4. **Run allocation multiple times** to see updates
5. **Use drag & drop** for easy preference ranking

---

## 🎊 Everything Works!

The system is fully functional and ready to use!

**Enjoy!** 🚀
