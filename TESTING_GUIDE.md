# Testing Guide

Complete guide for testing the Course Allocation System.

## Manual Testing Checklist

### 1. Authentication Testing

#### Student Login
- [ ] Login with valid credentials
- [ ] Login with invalid email
- [ ] Login with invalid password
- [ ] Login with empty fields
- [ ] Verify JWT token is stored
- [ ] Verify redirect to student dashboard

#### Admin Login
- [ ] Login with valid admin credentials
- [ ] Login with invalid credentials
- [ ] Verify redirect to admin dashboard
- [ ] Verify admin-only access

#### Student Registration
- [ ] Register new student with valid data
- [ ] Try duplicate email
- [ ] Try invalid email format
- [ ] Try missing required fields
- [ ] Verify auto-login after registration

### 2. Student Features Testing

#### Course Catalog
- [ ] View all courses
- [ ] Search courses by code
- [ ] Search courses by name
- [ ] Filter by department
- [ ] Verify course details display
- [ ] Check seat availability display
- [ ] View prerequisites

#### Preference Submission
- [ ] Add courses to preferences
- [ ] Remove courses from preferences
- [ ] Reorder preferences (drag & drop)
- [ ] Submit preferences
- [ ] Edit existing preferences
- [ ] Try submitting duplicate courses
- [ ] Try submitting after deadline
- [ ] Verify preference ranking

#### Allocation Results
- [ ] View allocated courses
- [ ] Verify course details
- [ ] Check time slots
- [ ] View when no allocation exists

#### Student Dashboard
- [ ] View preference count
- [ ] View allocation count
- [ ] View allocation status
- [ ] Quick action links work
- [ ] Recent preferences display

### 3. Admin Features Testing

#### Course Management
- [ ] View all courses
- [ ] Create new course
- [ ] Edit existing course
- [ ] Delete course
- [ ] Try duplicate course code
- [ ] Verify enrolled count updates
- [ ] Add prerequisites
- [ ] Remove prerequisites

#### Allocation Algorithm
- [ ] Run allocation with preferences
- [ ] Run allocation without preferences
- [ ] Verify GPA-based priority
- [ ] Check prerequisite validation
- [ ] Verify time conflict detection
- [ ] Check seat capacity limits
- [ ] View allocation results
- [ ] Verify enrollment counts update

#### Reports
- [ ] View enrollment report
- [ ] Check utilization percentages
- [ ] View course demand analysis
- [ ] Check demand ratios
- [ ] View unallocated students
- [ ] Verify analytics dashboard
- [ ] Check popular courses
- [ ] View department statistics

### 4. Security Testing

#### Authorization
- [ ] Student cannot access admin routes
- [ ] Admin cannot access student-specific routes
- [ ] Unauthenticated users redirected to login
- [ ] JWT token expiration works
- [ ] Invalid tokens rejected

#### Input Validation
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Invalid data types rejected
- [ ] Required fields enforced
- [ ] Email format validation
- [ ] Number range validation

### 5. Edge Cases Testing

#### Allocation Edge Cases
- [ ] Student with no preferences
- [ ] Course with no seats available
- [ ] All preferences unavailable
- [ ] Time slot conflicts
- [ ] Prerequisites not met
- [ ] Multiple students same GPA
- [ ] Course at full capacity

#### Data Edge Cases
- [ ] Empty course catalog
- [ ] No students registered
- [ ] No preferences submitted
- [ ] All courses full
- [ ] Invalid course IDs
- [ ] Negative seat capacity
- [ ] Invalid time slots

### 6. UI/UX Testing

#### Responsiveness
- [ ] Desktop view (1920x1080)
- [ ] Laptop view (1366x768)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] Navigation menu responsive
- [ ] Tables scroll on mobile

#### User Experience
- [ ] Loading states display
- [ ] Error messages clear
- [ ] Success messages display
- [ ] Forms validate on submit
- [ ] Buttons disabled during loading
- [ ] Confirmation dialogs work

### 7. Performance Testing

#### Load Testing
- [ ] 10 concurrent users
- [ ] 50 concurrent users
- [ ] 100 concurrent users
- [ ] Large course catalog (100+ courses)
- [ ] Many preferences (1000+ records)
- [ ] Database query performance

#### Response Times
- [ ] Login < 1 second
- [ ] Course list < 2 seconds
- [ ] Preference submission < 1 second
- [ ] Allocation run < 5 seconds
- [ ] Reports load < 3 seconds

## Automated Testing

### Backend API Tests

Create `backend/tests/api.test.js`:

```javascript
const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  test('Student login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/student/login')
      .send({
        email: 'alice@student.edu',
        password: 'student123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.role).toBe('student');
  });

  test('Login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/student/login')
      .send({
        email: 'invalid@test.com',
        password: 'wrong'
      });
    
    expect(response.status).toBe(401);
  });
});

describe('Courses', () => {
  let token;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/student/login')
      .send({
        email: 'alice@student.edu',
        password: 'student123'
      });
    token = response.body.token;
  });

  test('Get all courses', async () => {
    const response = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### Frontend Component Tests

Create `frontend/src/tests/Login.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

describe('Login Component', () => {
  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login setUser={() => {}} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Course Allocation System')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  test('switches between student and admin', () => {
    render(
      <BrowserRouter>
        <Login setUser={() => {}} />
      </BrowserRouter>
    );
    
    const adminButton = screen.getByText('Admin');
    fireEvent.click(adminButton);
    
    expect(screen.getByPlaceholderText('admin@university.edu')).toBeInTheDocument();
  });
});
```

## Test Scenarios

### Scenario 1: Complete Student Workflow

1. **Register** new student
2. **Login** with credentials
3. **Browse** course catalog
4. **Submit** 5 course preferences
5. **Wait** for admin to run allocation
6. **View** allocation results
7. **Verify** no time conflicts

### Scenario 2: Complete Admin Workflow

1. **Login** as admin
2. **Create** 3 new courses
3. **Set** prerequisites
4. **View** student preferences
5. **Run** allocation algorithm
6. **Review** allocation results
7. **Generate** reports
8. **Analyze** course demand

### Scenario 3: Allocation Algorithm Test

**Setup:**
- 5 students with different GPAs
- 3 courses with limited seats
- Various preference rankings

**Expected Results:**
- Higher GPA students get priority
- Preferences respected in order
- No seat over-allocation
- Time conflicts prevented
- Prerequisites validated

**Test Data:**
```
Student A (GPA 3.9): Preferences [CS101, CS201, MATH101]
Student B (GPA 3.7): Preferences [CS101, MATH101, PHY101]
Student C (GPA 3.5): Preferences [CS101, CS201, ENG101]
Student D (GPA 3.3): Preferences [MATH101, CS101, HIST101]
Student E (GPA 3.1): Preferences [CS201, MATH101, CS101]

CS101: 2 seats
CS201: 2 seats (prerequisite: CS101)
MATH101: 2 seats
```

**Expected Allocation:**
- Student A: CS101 (1st choice, highest GPA)
- Student B: MATH101 (2nd choice, CS101 full)
- Student C: CS101 (1st choice, 2nd highest GPA)
- Student D: HIST101 (3rd choice, others full)
- Student E: MATH101 (2nd choice, CS201 needs prereq)

### Scenario 4: Conflict Detection Test

**Test Cases:**
1. Same time slot: Mon/Wed 9:00-10:30
2. Overlapping days: Mon/Wed vs Mon/Fri
3. Different time slots: No conflict

**Expected:**
- System prevents time conflicts
- Student allocated to next preference
- Clear error messages

### Scenario 5: Prerequisite Validation

**Test Cases:**
1. Student with GPA < 3.0 → Prerequisites not satisfied
2. Student with GPA ≥ 3.0 → Prerequisites satisfied
3. Course with no prerequisites → Always allowed

**Expected:**
- Prerequisite rules enforced
- Students skip courses without prerequisites
- Allocation moves to next preference

## Database Testing

### Data Integrity Tests

```sql
-- Test unique constraints
INSERT INTO students (name, email, department, gpa, password_hash)
VALUES ('Test', 'alice@student.edu', 'CS', 3.5, 'hash');
-- Should fail: duplicate email

-- Test foreign key constraints
INSERT INTO preferences (student_id, course_id, preference_rank)
VALUES (999, 1, 1);
-- Should fail: invalid student_id

-- Test check constraints
INSERT INTO courses (course_code, course_name, department, instructor, seat_capacity, time_slot)
VALUES ('TEST', 'Test Course', 'CS', 'Dr. Test', -5, 'Mon 9:00');
-- Should fail: negative capacity
```

### Performance Tests

```sql
-- Test query performance
EXPLAIN ANALYZE
SELECT * FROM courses
WHERE department = 'Computer Science';

-- Test join performance
EXPLAIN ANALYZE
SELECT s.name, c.course_name
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id;
```

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Alt text for images
- [ ] ARIA labels present

## Bug Reporting Template

```markdown
**Bug Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]

**Actual Result**: [What actually happens]

**Environment**:
- Browser: [Chrome 120]
- OS: [Windows 11]
- User Role: [Student/Admin]

**Screenshots**: [If applicable]

**Console Errors**: [If any]
```

## Test Coverage Goals

- Backend API: 80%+ coverage
- Frontend Components: 70%+ coverage
- Critical paths: 100% coverage
- Edge cases: 90%+ coverage

## Continuous Testing

### Pre-commit Checks
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Unit tests pass
- [ ] No console errors

### Pre-deployment Checks
- [ ] All tests pass
- [ ] Manual smoke test
- [ ] Database migrations tested
- [ ] Environment variables set
- [ ] Security scan completed

---

**Testing is crucial for production readiness!**

Complete this checklist before deploying to production.
