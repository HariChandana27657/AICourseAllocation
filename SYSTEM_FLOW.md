# 🔄 Complete System Flow Diagram

## End-to-End Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     COURSE ALLOCATION SYSTEM                     │
│                         COMPLETE FLOW                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: ADMIN ADDS COURSES                                       │
└──────────────────────────────────────────────────────────────────┘

    👨‍💼 Admin Login
         ↓
    📚 Course Management Page
         ↓
    ➕ Add New Course
         ↓
    💾 Save to Database (courses table)
         ↓
    ✅ Course Created!


┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: STUDENT BROWSES & SEES COURSES                           │
└──────────────────────────────────────────────────────────────────┘

    👨‍🎓 Student Login
         ↓
    📖 Course Catalog Page
         ↓
    🔍 GET /api/courses
         ↓
    ✅ SEE ALL ADMIN-ADDED COURSES!
         ↓
    🔎 Search & Filter
         ↓
    👀 View Course Details


┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: STUDENT SUBMITS PREFERENCES                              │
└──────────────────────────────────────────────────────────────────┘

    👨‍🎓 Student
         ↓
    📝 Preferences Page
         ↓
    ➕ Add Courses from Catalog
         ↓
    🎯 Drag & Drop to Rank
         ↓
         1️⃣ First Choice
         2️⃣ Second Choice
         3️⃣ Third Choice
         ↓
    📤 Submit Preferences
         ↓
    POST /api/preferences
         ↓
    💾 Save to Database (preferences table)
         ↓
    ✅ SUCCESS MESSAGE!


┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: ADMIN VIEWS STUDENT SUBMISSIONS                          │
└──────────────────────────────────────────────────────────────────┘

    👨‍💼 Admin Login
         ↓
    📋 Student Preferences Page (NEW!)
         ↓
    🔍 GET /api/reports/preferences
         ↓
    ✅ SEE ALL STUDENT SUBMISSIONS!
         ↓
    👀 View Each Student's Ranked Choices
         ↓
    📊 Statistics Dashboard
         ↓
    🔎 Filter by Student/Department


┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: ADMIN RUNS ALLOCATION                                    │
└──────────────────────────────────────────────────────────────────┘

    👨‍💼 Admin Dashboard
         ↓
    🚀 Click "Run Allocation Algorithm"
         ↓
    POST /api/allocation/run
         ↓
    🧮 ALLOCATION ALGORITHM:
         │
         ├─ Sort students by GPA (highest first)
         │
         ├─ For each student:
         │   │
         │   ├─ Get their preferences (ranked)
         │   │
         │   ├─ For each preference:
         │   │   │
         │   │   ├─ Check seat availability ✓
         │   │   ├─ Check time conflicts ✓
         │   │   ├─ Allocate if possible ✓
         │   │   └─ Update enrollment count ✓
         │   │
         │   └─ Move to next student
         │
         └─ Complete!
         ↓
    💾 Save to Database (enrollments table)
         ↓
    ✅ ALLOCATION COMPLETE!


┌──────────────────────────────────────────────────────────────────┐
│ STEP 6: STUDENT VIEWS RESULTS                                    │
└──────────────────────────────────────────────────────────────────┘

    👨‍🎓 Student Login
         ↓
    🎯 Results Page
         ↓
    🔍 GET /api/allocation/results
         ↓
    ✅ SEE ALLOCATED COURSES!
         ↓
    📅 View Schedule
         ↓
    📥 Download Schedule
         ↓
    🎉 DONE!


═══════════════════════════════════════════════════════════════════

## Data Flow Diagram

```
┌─────────┐         ┌──────────┐         ┌─────────┐
│  ADMIN  │────────▶│ COURSES  │────────▶│ STUDENT │
└─────────┘  adds   └──────────┘  views  └─────────┘
                         │                     │
                         │                     │ submits
                         │                     ▼
                         │              ┌─────────────┐
                         │              │ PREFERENCES │
                         │              └─────────────┘
                         │                     │
                         │                     │ views
                         │                     ▼
                         │              ┌─────────┐
                         │              │  ADMIN  │
                         │              └─────────┘
                         │                     │
                         │                     │ runs
                         │                     ▼
                         │              ┌────────────┐
                         └─────────────▶│ ALLOCATION │
                                        └────────────┘
                                              │
                                              │ creates
                                              ▼
                                        ┌─────────────┐
                                        │ ENROLLMENTS │
                                        └─────────────┘
                                              │
                                              │ views
                                              ▼
                                        ┌─────────┐
                                        │ STUDENT │
                                        └─────────┘
```

═══════════════════════════════════════════════════════════════════

## Database Tables

```
┌──────────────┐
│   COURSES    │
├──────────────┤
│ id           │
│ course_code  │
│ course_name  │
│ department   │
│ instructor   │
│ time_slot    │
│ seat_capacity│
│ enrolled_count│
└──────────────┘
       │
       │ referenced by
       ▼
┌──────────────┐
│ PREFERENCES  │
├──────────────┤
│ id           │
│ student_id   │◀─────┐
│ course_id    │      │
│ preference_rank│     │
└──────────────┘      │
       │              │
       │ used by      │
       ▼              │
┌──────────────┐      │
│ ENROLLMENTS  │      │
├──────────────┤      │
│ id           │      │
│ student_id   │◀─────┤
│ course_id    │      │
│ allocation_status│  │
└──────────────┘      │
                      │
                ┌─────────────┐
                │  STUDENTS   │
                ├─────────────┤
                │ id          │
                │ name        │
                │ email       │
                │ department  │
                │ gpa         │
                └─────────────┘
```

═══════════════════════════════════════════════════════════════════

## API Endpoints Flow

```
ADMIN WORKFLOW:
    POST /api/auth/admin/login
         ↓
    POST /api/courses (add course)
         ↓
    GET /api/reports/preferences (view submissions) ← NEW!
         ↓
    POST /api/allocation/run (run algorithm)
         ↓
    GET /api/reports/analytics (view stats)


STUDENT WORKFLOW:
    POST /api/auth/student/login
         ↓
    GET /api/courses (browse catalog)
         ↓
    POST /api/preferences (submit choices)
         ↓
    GET /api/allocation/results (view allocation)
```

═══════════════════════════════════════════════════════════════════

## Page Navigation Flow

```
ADMIN PAGES:
    /login
      ↓
    /admin (Dashboard)
      ├─→ /admin/courses (Manage Courses)
      ├─→ /admin/preferences (View Submissions) ← NEW!
      └─→ /admin/reports (Analytics)


STUDENT PAGES:
    /login
      ↓
    /student (Dashboard)
      ├─→ /student/courses (Browse Catalog)
      ├─→ /student/preferences (Submit Choices)
      └─→ /student/results (View Allocation)
```

═══════════════════════════════════════════════════════════════════

## Key Features Highlighted

✅ STUDENTS CAN:
   • See ALL admin-added courses
   • Submit ranked preferences
   • View allocation results

✅ ADMIN CAN:
   • Add/Edit/Delete courses
   • View ALL student submissions ← NEW!
   • Run allocation algorithm
   • View analytics

✅ SYSTEM PROVIDES:
   • Complete transparency
   • Real-time updates
   • Smart allocation
   • Beautiful UI

═══════════════════════════════════════════════════════════════════

## Success Indicators

✅ Course added by admin → Visible in student catalog
✅ Preference submitted by student → Visible in admin preferences page
✅ Allocation run by admin → Results visible to students
✅ Complete workflow → End-to-end functionality

═══════════════════════════════════════════════════════════════════

🎉 SYSTEM IS COMPLETE AND FULLY FUNCTIONAL! 🎉
