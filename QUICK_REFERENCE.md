# Quick Reference - Course Allocation System Updates

## Summary of Changes

### ✅ Database Schema
- Students: Added `cgpa` and `year_of_study`
- Courses: Added `section`, `course_type`, `year_of_study`
- New Table: `completed_courses` (tracks previously taken courses)

### ✅ Allocation Algorithm
**File**: `backend/src/services/allocationService.js`

Key improvements:
1. **CGPA-Based Priority Tiers**: 8.0+, 7.5+, 7.0+, 6.5+, 6.0+, <6.0
2. **One Course Per Student**: Allocation breaks after successful assignment
3. **Course Repetition Prevention**: Checks `completed_courses` table
4. **Year-of-Study Matching**: Only electives for student's year
5. **Detailed Logging**: Console shows allocation process per student

### ✅ API Updates

**Authentication** (`backend/src/controllers/authController.js`)
- Login/Register now include `yearOfStudy` and use `cgpa` instead of `gpa`

**Allocation** (`backend/src/controllers/allocationController.js`)
- NEW: `getAll Allocations()` - Admin view of all results
- NEW: `getCompletedCourses()` - Student's completed courses
- NEW: `markCourseCompleted()` - Record course completion
- UPDATED: `getStudentAllocation()` - Returns single course only

**Courses** (`backend/src/controllers/courseController.js`)
- NEW: `getCoursesByYearOfStudy()` - Returns only electives for student's year
  - Marks which courses student has completed
  - Shows available seats
- UPDATED: Course creation/update requires `year_of_study`, `section`, `course_type`

**Preferences** (`backend/src/controllers/preferenceController.js`)
- UPDATED: `submitPreferences()` validates against completed courses
- Prevents students from selecting already-completed courses
- Validates course is for student's year and is elective type

### ✅ Routes

**Allocation Routes** (`backend/src/routes/allocationRoutes.js`)
- `POST /allocation/run` - Run allocation (Admin)
- `GET /allocation/all` - Get all results (Admin) [NEW]
- `GET /allocation/results` - Get student's result (Student)
- `POST /allocation/mark-completed` - Mark course done (Student) [NEW]
- `GET /allocation/completed-courses` - Get student's history (Student) [NEW]

**Course Routes** (`backend/src/routes/courseRoutes.js`)
- `GET /courses/available/by-year` - Get eligible courses (Student) [NEW]
- Other routes updated to handle new fields

---

## Data Flow - Example Scenario

### Scenario: Allocating 3rd-year Computer Science students

```
Student: Hari (CGPA: 7.99, Year: 3)
├─ Preferences: CS301-A (Rank 1), CS201-B (Rank 2), MATH101-A (Rank 3)
│
Step 1: system groups by tier
└─ Tier 3 (7.0-7.49) ← Hari is here
   └─ Start processing...
   
Step 2: Check first preference (CS301-A)
├─ Completed before? NO ✓
├─ Seats available? YES (5/35) ✓
├─ Time conflict? NO ✓
└─ ALLOCATE → Success!
   ├─ Insert into enrollments
   ├─ enrolled_count: 28 → 29
   └─ STOP (only 1 course per student)

Result → Hari allocated: CS301 - Advance Java Section A
```

---

## Before & After Comparison

### BEFORE
```sql
-- Single course per student (if any)
SELECT * FROM allocations WHERE student_id = 1;
-- Result: Multiple rows possible

-- No course history
-- No year filtering
-- GPA only (3 decimals)
```

### AFTER
```sql
-- Exactly one course per student
SELECT * FROM enrollments WHERE student_id = 1;
-- Result: 0 or 1 row

-- Track completed courses
SELECT * FROM completed_courses WHERE student_id = 1;
-- Result: List of previously taken courses

-- Filter by year automatically
GET /courses/available/by-year
-- Returns only electives for Hari's year (3rd year)

-- CGPA precision (4 decimals)
SELECT cgpa FROM students WHERE id = 1; -- 8.21 (not 8.2)
```

---

## Testing Command Examples

### 1. Create Courses (Admin)
```bash
curl -X POST http://localhost:5000/courses \
-H "Authorization: Bearer ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "course_code": "CS301",
  "course_name": "Advanced Java Programming",
  "department": "Computer Science",
  "section": "A",
  "course_type": "elective",
  "year_of_study": 3,
  "seat_capacity": 35,
  "instructor": "Dr. Smith",
  "time_slot": "Mon/Wed 10:00-11:30"
}'
```

### 2. Register Student
```bash
curl -X POST http://localhost:5000/auth/register \
-H "Content-Type: application/json" \
-d '{
  "name": "Hari Chandana",
  "email": "hari@gmail.com",
  "department": "Computer Science",
  "cgpa": 7.99,
  "yearOfStudy": 3,
  "password": "pass123"
}'
```

### 3. Submit Preferences
```bash
curl -X POST http://localhost:5000/preferences \
-H "Authorization: Bearer STUDENT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "preferences": [
    {"course_id": 1, "preference_rank": 1},
    {"course_id": 2, "preference_rank": 2},
    {"course_id": 3, "preference_rank": 3}
  ]
}'
```

### 4. Run Allocation (Admin)
```bash
curl -X POST http://localhost:5000/allocation/run \
-H "Authorization: Bearer ADMIN_TOKEN"
```

### 5. Get Student's Allocated Course
```bash
curl -X GET http://localhost:5000/allocation/results \
-H "Authorization: Bearer STUDENT_TOKEN"

# Response:
# {
#   "studentId": 1,
#   "allocatedCourse": {
#     "courseCode": "CS301",
#     "courseName": "Advanced Java",
#     "section": "A",
#     "instructor": "Dr. Smith",
#     "timeSlot": "Mon/Wed 10:00-11:30"
#   }
# }
```

---

## Key Data Types

### CGPA
- Type: DECIMAL(4,2)
- Range: 0.00 to 10.00
- Example: 8.21, 7.95, 6.50

### Year of Study
- Type: INTEGER
- Valid: 1, 2, 3, 4
- Constraint: CHECK (year_of_study >= 1 AND year_of_study <= 4)

### Section
- Type: VARCHAR(10)
- Examples: 'A', 'B', 'C', 'Lab1', 'Online'
- Unique with: course_code (composite key)

### Course Type
- Type: VARCHAR(50)
- Values: 'core', 'elective', 'open'
- Used to: Filter available courses for students

---

## Column Names Reference

| Table | Old Name | New Name | Purpose |
|-------|----------|----------|---------|
| students | gpa | cgpa | Higher precision CGPA |
| students | - | year_of_study | Current year (1-4) |
| courses | (none) | section | Section identifier |
| courses | (none) | course_type | core/elective/open |
| courses | (none) | year_of_study | Year offered |
| allocations | multiple rows | enrollments (one row) | Only one per student |

---

## Troubleshooting

### Issue: Student not getting allocated
**Check:**
1. ✓ Preferences submitted with correct course IDs
2. ✓ Courses match student's year of study
3. ✓ Courses are type 'elective'
4. ✓ Seats available (enrolled_count < seat_capacity)
5. ✓ No time conflicts with other enrollments
6. ✓ Course not in completed_courses

### Issue: Getting "Course repetition not allowed" error
**Solution:** The course is in student's completed_courses. This is intentional - students cannot retake completed courses.

### Issue: "Year of study must be between 1 and 4"
**Solution:** When registering/updating student, provide yearOfStudy as number 1-4, not string.

### Issue: Duplicate course_code error
**Solution:** Create courses with both course_code AND section:
- ✓ CS101 Section A
- ✓ CS101 Section B (allowed - different section)
- ✗ CS101 Section A (duplicate - error)

---

## Important Notes

1. **First Allocation:** Clears all existing enrollments (by design)
2. **Section Mandatory:** All courses must now have a section
3. **Year Filtering:** Student sees only electives for their year
4. **One Course Rule:** Strictly enforced - allocation stops after 1 course
5. **CGPA Precision:** Use 4-digit decimals (e.g., 8.21 not 8.2)

---

## Success Metric

✅ **Goals Achieved:**
- [x] CGPA-based priority allocation
- [x] One course per student
- [x] Course repetition prevention
- [x] Year-wise course assignment
- [x] Seat capacity enforcement
- [x] Time conflict detection
- [x] Student dashboard shows year
- [x] Complete audit trail (completed_courses)

