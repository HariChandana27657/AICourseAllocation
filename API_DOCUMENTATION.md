# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Student Login
**POST** `/auth/student/login`

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@student.edu",
    "department": "Computer Science",
    "gpa": 3.8,
    "role": "student"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials

---

### 2. Admin Login
**POST** `/auth/admin/login`

**Request Body:**
```json
{
  "email": "admin@university.edu",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "System Admin",
    "email": "admin@university.edu",
    "role": "admin"
  }
}
```

---

### 3. Student Registration
**POST** `/auth/student/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@student.edu",
  "department": "Computer Science",
  "gpa": 3.5,
  "password": "password123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 6,
    "name": "John Doe",
    "email": "john@student.edu",
    "department": "Computer Science",
    "gpa": 3.5,
    "role": "student"
  }
}
```

**Error Responses:**
- `400`: Missing required fields or email already registered

---

## Course Endpoints

### 4. Get All Courses
**GET** `/courses`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "course_code": "CS101",
    "course_name": "Introduction to Programming",
    "department": "Computer Science",
    "instructor": "Dr. Smith",
    "seat_capacity": 50,
    "enrolled_count": 35,
    "available_seats": 15,
    "time_slot": "Mon/Wed 9:00-10:30",
    "description": "Basic programming concepts",
    "prerequisites": []
  }
]
```

---

### 5. Get Course by ID
**GET** `/courses/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "course_code": "CS101",
  "course_name": "Introduction to Programming",
  "department": "Computer Science",
  "instructor": "Dr. Smith",
  "seat_capacity": 50,
  "enrolled_count": 35,
  "available_seats": 15,
  "time_slot": "Mon/Wed 9:00-10:30",
  "description": "Basic programming concepts",
  "prerequisites": []
}
```

**Error Responses:**
- `404`: Course not found

---

### 6. Create Course (Admin Only)
**POST** `/courses`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "course_code": "CS401",
  "course_name": "Advanced Algorithms",
  "department": "Computer Science",
  "instructor": "Dr. Johnson",
  "seat_capacity": 30,
  "time_slot": "Tue/Thu 14:00-15:30",
  "description": "Advanced algorithm design and analysis",
  "prerequisites": [2, 3]
}
```

**Response (201):**
```json
{
  "id": 9,
  "course_code": "CS401",
  "course_name": "Advanced Algorithms",
  "department": "Computer Science",
  "instructor": "Dr. Johnson",
  "seat_capacity": 30,
  "enrolled_count": 0,
  "time_slot": "Tue/Thu 14:00-15:30",
  "description": "Advanced algorithm design and analysis"
}
```

**Error Responses:**
- `400`: Missing required fields or duplicate course code
- `403`: Admin role required

---

### 7. Update Course (Admin Only)
**PUT** `/courses/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "course_code": "CS401",
  "course_name": "Advanced Algorithms",
  "department": "Computer Science",
  "instructor": "Dr. Williams",
  "seat_capacity": 35,
  "time_slot": "Tue/Thu 14:00-15:30",
  "description": "Updated description",
  "prerequisites": [2]
}
```

**Response (200):**
```json
{
  "id": 9,
  "course_code": "CS401",
  "course_name": "Advanced Algorithms",
  "department": "Computer Science",
  "instructor": "Dr. Williams",
  "seat_capacity": 35,
  "enrolled_count": 0,
  "time_slot": "Tue/Thu 14:00-15:30",
  "description": "Updated description"
}
```

**Error Responses:**
- `404`: Course not found
- `403`: Admin role required

---

### 8. Delete Course (Admin Only)
**DELETE** `/courses/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "Course deleted successfully"
}
```

**Error Responses:**
- `404`: Course not found
- `403`: Admin role required

---

## Preference Endpoints

### 9. Get Student Preferences
**GET** `/preferences`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "student_id": 1,
    "course_id": 1,
    "preference_rank": 1,
    "course_code": "CS101",
    "course_name": "Introduction to Programming",
    "department": "Computer Science",
    "instructor": "Dr. Smith",
    "time_slot": "Mon/Wed 9:00-10:30",
    "available_seats": 15
  }
]
```

---

### 10. Submit Preferences
**POST** `/preferences`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Request Body:**
```json
{
  "preferences": [
    { "course_id": 1, "preference_rank": 1 },
    { "course_id": 2, "preference_rank": 2 },
    { "course_id": 3, "preference_rank": 3 }
  ]
}
```

**Response (200):**
```json
{
  "message": "Preferences submitted successfully",
  "preferences": [
    {
      "id": 1,
      "student_id": 1,
      "course_id": 1,
      "preference_rank": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "department": "Computer Science"
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid preferences, duplicate courses, or deadline passed
- `403`: Student role required

---

### 11. Delete Preferences
**DELETE** `/preferences`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200):**
```json
{
  "message": "Preferences deleted successfully"
}
```

---

## Allocation Endpoints

### 12. Run Allocation Algorithm (Admin Only)
**POST** `/allocation/run`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Allocation completed successfully",
  "totalStudents": 5,
  "results": [
    {
      "studentId": 1,
      "studentName": "Alice Johnson",
      "gpa": 3.8,
      "allocatedCourses": [
        {
          "courseCode": "CS101",
          "courseName": "Introduction to Programming",
          "rank": 1,
          "timeSlot": "Mon/Wed 9:00-10:30"
        }
      ],
      "failedAllocations": []
    }
  ]
}
```

**Error Responses:**
- `403`: Admin role required
- `500`: Allocation failed

---

### 13. Get Allocation Results (Student)
**GET** `/allocation/results`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200):**
```json
{
  "studentId": 1,
  "allocatedCourses": [
    {
      "id": 1,
      "student_id": 1,
      "course_id": 1,
      "allocation_status": "allocated",
      "allocated_at": "2026-03-13T10:30:00.000Z",
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "department": "Computer Science",
      "instructor": "Dr. Smith",
      "time_slot": "Mon/Wed 9:00-10:30",
      "seat_capacity": 50
    }
  ]
}
```

---

## Report Endpoints (Admin Only)

### 14. Get Enrollment Report
**GET** `/reports/enrollment`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "course_code": "CS101",
    "course_name": "Introduction to Programming",
    "department": "Computer Science",
    "instructor": "Dr. Smith",
    "seat_capacity": 50,
    "enrolled_count": 35,
    "available_seats": 15,
    "utilization_percentage": 70.00
  }
]
```

---

### 15. Get Unallocated Students
**GET** `/reports/unallocated`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "id": 5,
    "name": "Emma Davis",
    "email": "emma@student.edu",
    "department": "Computer Science",
    "gpa": 3.7,
    "preferences_submitted": 3,
    "courses_allocated": 0
  }
]
```

---

### 16. Get Course Demand Analysis
**GET** `/reports/demand`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "course_code": "CS101",
    "course_name": "Introduction to Programming",
    "department": "Computer Science",
    "seat_capacity": 50,
    "enrolled_count": 35,
    "total_preferences": 45,
    "first_choice_count": 20,
    "top_three_count": 40,
    "demand_ratio": 0.90
  }
]
```

---

### 17. Get Dashboard Analytics
**GET** `/reports/analytics`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "overview": {
    "total_students": 5,
    "total_courses": 8,
    "students_with_preferences": 4,
    "students_allocated": 4,
    "total_enrollments": 12,
    "total_capacity": 400,
    "avg_utilization": 65.50
  },
  "popularCourses": [
    {
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "preference_count": 45
    }
  ],
  "departmentStats": [
    {
      "department": "Computer Science",
      "course_count": 3,
      "total_enrolled": 85
    }
  ]
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Invalid credentials |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 500  | Internal Server Error |

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting in production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user

---

## Pagination

For large datasets, consider implementing pagination:
```
GET /courses?page=1&limit=20
```

---

## Testing with cURL

### Login Example:
```bash
curl -X POST http://localhost:5000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@student.edu","password":"student123"}'
```

### Get Courses Example:
```bash
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Submit Preferences Example:
```bash
curl -X POST http://localhost:5000/api/preferences \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"preferences":[{"course_id":1,"preference_rank":1}]}'
```

---

## WebSocket Support (Future)

Consider adding WebSocket support for:
- Real-time seat availability updates
- Live allocation progress
- Instant notifications

---

**Last Updated**: March 13, 2026
