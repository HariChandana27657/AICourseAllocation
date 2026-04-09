# Course Allocation System - Implementation Guide

## Overview
This document details all the modifications made to implement the requirements for an advanced course allocation system with CGPA-based priority, course repetition restrictions, and year-wise course allocation.

---

## 1. Database Schema Updates

### New Fields Added

#### Students Table
- **`cgpa`** (DECIMAL 4,2): Changed from `gpa` for precision (0.0-10.0)
- **`year_of_study`** (INTEGER): Student's current year (1-4)
  - Added index: `idx_students_year`

#### Courses Table
- **`section`** (VARCHAR 10): Course section identifier (A, B, C, etc.)
- **`course_type`** (VARCHAR 50): Type of course - `core`, `elective`, or `open` (default: `elective`)
- **`year_of_study`** (INTEGER): Year for which course is offered (1-4)
  - Added index: `idx_courses_year`
- **Unique Constraint**: `(course_code, section)` - allows same course code in different sections

#### New Table: `completed_courses`
Tracks courses already completed by students to prevent re-enrollment:

```sql
CREATE TABLE completed_courses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    completed_semester VARCHAR(50),
    grade VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);
```

### Indexes Added
- `idx_students_year`: Quick lookup by year of study
- `idx_courses_year`: Filter courses by year
- `idx_completed_courses_student`: Get student's completed courses
- `idx_completed_courses_course`: Track course completions

---

## 2. Allocation Algorithm [CGPA-Based Priority]

### File: `backend/src/services/allocationService.js`

#### Key Features:

**1. CGPA Tier-Based Priority**
```
Tier 1: CGPA ≥ 8.0  (Highest Priority)
Tier 2: CGPA ≥ 7.5
Tier 3: CGPA ≥ 7.0
Tier 4: CGPA ≥ 6.5
Tier 5: CGPA ≥ 6.0
Tier 6: CGPA < 6.0  (Lowest Priority)
```

**2. One Course Per Student**
- Each student allocated exactly ONE elective course
- Loop breaks after successful allocation

**3. Course Repetition Check**
```javascript
const completed = await this.hasCompletedCourse(student.id, courseId);
if (completed) {
  // Skip this course
}
```

**4. Year-of-Study Matching**
- Only courses matching student's year offered
- Filters out courses meant for other years

**5. Allocation Process**
1. Group students by CGPA tier
2. For each tier (highest first):
   - For each student in tier:
     - Iterate preferences (ranked by student)
     - Validate course not previously completed
     - Check seat availability
     - Check time conflicts
     - Allocate first available course and STOP

### New Methods:

#### `getCGPATier(cgpa)`
Returns tier level (1-6) based on CGPA

#### `hasCompletedCourse(studentId, courseId)`
Checks if student has completed this course previously

#### `markCourseCompleted(studentId, courseId, semester, grade)`
Records course as completed

#### `getStudentCompletedCourses(studentId)`
Returns list of courses student has completed

#### `getAllAllocationResults()`
Returns comprehensive allocation report for admin

---

## 3. API Controller Updates

### File: `backend/src/controllers/allocationController.js`

#### New Endpoints:

```javascript
// Admin: Get all allocation results with grouping
GET /allocation/all
Response: {
  totalStudents: 50,
  allocations: [
    {
      studentId: 1,
      name: "John Doe",
      cgpa: 8.5,
      yearOfStudy: 3,
      allocatedCourse: {
        courseCode: "CS301",
        section: "A",
        instructor: "Dr. Smith",
        timeSlot: "Mon/Wed 9:00-10:30"
      }
    }
  ]
}

// Student: Mark course as completed
POST /allocation/mark-completed
Body: {
  courseId: 5,
  semester: "Fall 2025",
  grade: "A"
}

// Student: Get completed courses
GET /allocation/completed-courses
Response: {
  studentId: 1,
  completedCourses: [
    {
      courseCode: "CS101",
      courseName: "Programming Basics",
      completedSemester: "Spring 2025",
      grade: "A"
    }
  ]
}
```

#### Updated Endpoints:

```javascript
// Student: Get allocation results (now returns single course)
GET /allocation/results
Response: {
  studentId: 1,
  allocatedCourse: { courseCode, courseName, section, ... },
  status: "allocated" | "not_allocated"
}
```

---

### File: `backend/src/controllers/authController.js`

#### Updated Student Login Response:
Now includes `yearOfStudy` and changed `gpa` to `cgpa`:

```javascript
res.json({
  token: "...",
  user: {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    department: "Computer Science",
    cgpa: 8.21,
    yearOfStudy: 3,  // NEW
    role: "student"
  }
});
```

#### Updated Student Registration:
Requires `yearOfStudy` parameter:

```javascript
// POST /auth/register
{
  name: "John Doe",
  email: "john@example.com",
  department: "Computer Science",
  cgpa: 8.21,
  yearOfStudy: 3,  // NEW (1-4)
  password: "password123"
}
```

---

### File: `backend/src/controllers/courseController.js`

#### New Endpoint: Get Courses by Year of Study

```javascript
GET /courses/available/by-year
Response: [
  {
    id: 5,
    course_code: "CS301",
    course_name: "Advanced Java",
    section: "A",
    year_of_study: 3,
    course_type: "elective",
    seat_capacity: 35,
    enrolled_count: 28,
    available_seats: 7,
    time_slot: "Mon/Wed 10:00-11:30",
    isCompleted: false  // Already completed?
  }
]
```

**Features:**
- Only returns elective courses for student's year
- Marks courses already completed
- Shows available seats

#### Updated Course Creation:

```javascript
// POST /courses (Admin)
{
  course_code: "CS301",
  course_name: "Advanced Java Programming",
  department: "Computer Science",
  instructor: "Dr. Ravi Kishore",
  section: "A",           // NEW
  course_type: "elective", // NEW
  year_of_study: 3,        // NEW
  seat_capacity: 35,
  time_slot: "Mon/Wed 10:00-11:30",
  description: "..."
}
```

---

### File: `backend/src/controllers/preferenceController.js`

#### Updated Preference Submission:

Now includes **course repetition validation**:

```javascript
// Check if course already completed
const completedCourses = await query(
  `SELECT course_id FROM completed_courses 
   WHERE student_id = ? AND course_id IN (...)`,
  [studentId, ...courseIds]
);

if (completedCourses.length > 0) {
  return res.status(400).json({
    error: 'Course repetition not allowed',
    message: 'You have already completed: CS101, MATH201. Choose different courses.',
    repeatedCourses: 'CS101, MATH201'
  });
}
```

**Additional Validations:**
- All courses must be for student's year of study
- All courses must be type 'elective'
- No duplicate courses in single preference submission

---

## 4. Route Updates

### File: `backend/src/routes/allocationRoutes.js`

```javascript
// Admin: Run allocation (existing)
POST /allocation/run

// Admin: Get all results (NEW)
GET /allocation/all

// Student: Get results (updated)
GET /allocation/results

// Student: Get completed courses (NEW)
GET /allocation/completed-courses

// Student: Mark course completed (NEW)
POST /allocation/mark-completed
```

### File: `backend/src/routes/courseRoutes.js`

```javascript
// Get all courses (existing)
GET /courses

// Get courses by year (NEW) - Must come before /:id to avoid routing conflict
GET /courses/available/by-year

// Get single course (existing)
GET /courses/:id

// Create course (Admin)
POST /courses

// Update course (Admin)
PUT /courses/:id

// Delete course (Admin)
DELETE /courses/:id
```

---

## 5. Allocation Algorithm Workflow

### Step-by-Step Process:

```
START ALLOCATION
│
├─ 1. Clear existing enrollments
│  └─ Reset enrolled_count for all courses to 0
│
├─ 2. Fetch all students with year_of_study
│  └─ Sort by CGPA (descending)
│
├─ 3. Group students by CGPA tier
│  └─ Tier 1 (8.0+), Tier 2 (7.5+), etc.
│
├─ 4. For each CGPA tier (highest first):
│  │
│  └─ For each student in tier:
│     │
│     ├─ Fetch preferences (electives for student's year)
│     │
│     └─ For each preference (ranked):
│        │
│        ├─ Check: Already completed?
│        │  └─ If YES → Skip to next preference
│        │
│        ├─ Check: Seats available?
│        │  └─ If NO → Record failure, continue
│        │
│        ├─ Check: Time conflict?
│        │  └─ If YES → Record failure, continue
│        │
│        └─ SUCCESS: Allocate course
│           ├─ Insert into enrollments
│           ├─ Increment course.enrolled_count
│           ├─ Break (only 1 course per student)
│           └─ Create notification
│
├─ 5. Generate summary statistics
│  └─ Total allocated, not allocated, success rate
│
└─ END ALLOCATION
```

---

## 6. Sample Data Updates

### Courses Table Now Includes:

```sql
INSERT INTO courses (...) VALUES
('CS101', 'Machine Learning', 'CS', 'Dr. Smith', 'A', 'elective', 50, ..., 3, ...),
('CS101', 'Machine Learning', 'CS', 'Dr. Smith', 'B', 'elective', 50, ..., 3, ...),
('CS201', 'AI', 'CS', 'Dr. Rajesh', 'A', 'elective', 40, ..., 3, ...),
-- Note: Same course_code with different sections
```

### Students Table Now Includes:

```sql
INSERT INTO students (...) VALUES
('K N S Hari Chandana', 'hari@gmail.com', 'CS', 7.99, 3, ...),
('G SivaMani', 'siva@gmail.com', 'CS', 8.21, 3, ...),
('M Nikhitha', 'nikki@gmail.com', 'Math', 8.03, 2, ...),
-- Note: year_of_study added for each student
```

---

## 7. Key Business Rules Implemented

### Rule 1: CGPA-Based Priority
✅ Students with higher CGPA get allocation opportunities first
✅ Implemented via tier-based processing

### Rule 2: One Course Per Student
✅ Loop breaks after successful allocation
✅ Database enforces via cursor logic

### Rule 3: Course Repetition Prevention
✅ Query checks `completed_courses` table
✅ Validation at preference submission
✅ Skipped during allocation if completed

### Rule 4: Year-of-Study Matching
✅ Preferences filtered by `student.year_of_study = course.year_of_study`
✅ Courses endpoint marked to show only relevant courses

### Rule 5: Seat Capacity Enforcement
✅ Check: `available_seats = seat_capacity - enrolled_count > 0`
✅ Increment `enrolled_count` on allocation

### Rule 6: Time Conflict Detection
✅ Existing algorithm extended
✅ Same-day courses flagged as conflicts

---

## 8. Database Migration Path

### For Existing Systems:

```sql
-- Add new columns to students
ALTER TABLE students 
ADD COLUMN cgpa DECIMAL(4,2) DEFAULT 0.0,
ADD COLUMN year_of_study INTEGER DEFAULT 1;

-- Add new columns to courses
ALTER TABLE courses 
ADD COLUMN section VARCHAR(10) DEFAULT 'A',
ADD COLUMN course_type VARCHAR(50) DEFAULT 'elective',
ADD COLUMN year_of_study INTEGER DEFAULT 1;

-- Create completed_courses table
CREATE TABLE completed_courses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    completed_semester VARCHAR(50),
    grade VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- Update existing course code uniqueness constraint
-- Drop: UNIQUE(course_code)
-- Add: UNIQUE(course_code, section)
```

---

## 9. Testing Checklist

- [ ] Allocation respects CGPA tiers (8.0+, 7.5+, etc.)
- [ ] Each student gets exactly one course (not zero, not multiple)
- [ ] Students with completed courses cannot select them
- [ ] Courses only shown for student's year of study
- [ ] Seat capacity enforced (no overbooking)
- [ ] Time conflicts properly detected
- [ ] Notifications sent to students and admins
- [ ] Dashboard displays year of study
- [ ] Login/registration includes yearOfStudy
- [ ] Course API filters by elective type

---

## 10. API Reference Summary

### Authentication
- Login: `POST /auth/student` → Returns `yearOfStudy`
- Register: `POST /auth/register` → Accepts `yearOfStudy`

### Allocation
- Run: `POST /allocation/run` (Admin)
- Results: `GET /allocation/results` (Student - one course)
- All Results: `GET /allocation/all` (Admin)
- Mark Completed: `POST /allocation/mark-completed` (Student)
- Completed Courses: `GET /allocation/completed-courses` (Student)

### Courses
- Get All: `GET /courses`
- Get By Year: `GET /courses/available/by-year` (Student - filtered)
- Get One: `GET /courses/:id`
- Create: `POST /courses` (Admin - requires `year_of_study`, `section`, `course_type`)
- Update: `PUT /courses/:id` (Admin)
- Delete: `DELETE /courses/:id` (Admin)

### Preferences
- Get: `GET /preferences` (Student)
- Submit: `POST /preferences` (Updated validation)
- Delete: `DELETE /preferences` (Student)

---

## 11. File List of Changes

1. ✅ `database/schema.sql` - Schema updates
2. ✅ `backend/src/services/allocationService.js` - Core allocation logic
3. ✅ `backend/src/controllers/allocationController.js` - New endpoints
4. ✅ `backend/src/controllers/authController.js` - Student login/register updates
5. ✅ `backend/src/controllers/courseController.js` - Course filtering & creation
6. ✅ `backend/src/controllers/preferenceController.js` - Course repetition validation
7. ✅ `backend/src/routes/allocationRoutes.js` - New routes
8. ✅ `backend/src/routes/courseRoutes.js` - New course endpoint

---

## 12. Deployment Notes

1. **Database First**: Run schema migration before code deployment
2. **Backward Compatibility**: Old `gpa` data should be migrated to `cgpa`
3. **Course Setup**: Re-import courses with `year_of_study`, `section`, `course_type`
4. **Student Setup**: Update all students with `year_of_study`
5. **Enrollment Clear**: First allocation will clear existing enrollments (by design)
6. **Testing**: Test with all CGPA tiers before production

---

For any questions or issues, refer to the API documentation or contact the development team.
