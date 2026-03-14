# Automated Student Course Allocation System

A complete production-ready full-stack web application that automates course allocation for university students using their ranked preferences, course seat capacity, prerequisites, timetable conflict detection, and fairness policies.

## 🎯 Features

### Student Module
- Student authentication and registration
- Browse course catalog with filters
- Submit and edit ranked course preferences (drag & drop)
- View allocation results
- Real-time seat availability tracking

### Admin Module
- Admin dashboard with analytics
- Course management (CRUD operations)
- Run allocation algorithm
- Comprehensive reports:
  - Enrollment statistics
  - Course demand analysis
  - Unallocated students
  - Department statistics

### Allocation Engine
- Priority-based weighted preference matching
- GPA-based student prioritization
- Prerequisite validation
- Time slot conflict detection
- Seat capacity management
- Fair and transparent allocation

## 🛠️ Tech Stack

### Frontend
- React.js 18 with TypeScript
- TailwindCSS for styling
- React Router for navigation
- Axios for API communication
- Vite for build tooling

### Backend
- Node.js with Express.js
- RESTful API architecture
- JWT authentication
- Role-based access control (Student/Admin)

### Database
- PostgreSQL
- Relational schema with proper indexing
- Transaction support for data integrity

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd course-allocation-system
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb course_allocation

# Or using psql
psql -U postgres
CREATE DATABASE course_allocation;
\q

# Import schema
psql -U postgres -d course_allocation -f database/schema.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Update DB_PASSWORD and JWT_SECRET
```

Example `.env` configuration:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=course_allocation
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👤 Demo Credentials

### Student Login
- Email: `alice@student.edu`
- Password: `student123`

### Admin Login
- Email: `admin@university.edu`
- Password: `admin123`

**Note:** The sample passwords in the database are hashed. For testing, you'll need to update the password hashes or create new users.

## 📚 API Documentation

### Authentication Endpoints

#### Student Login
```http
POST /api/auth/student/login
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "password123"
}
```

#### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@university.edu",
  "password": "password123"
}
```

#### Student Registration
```http
POST /api/auth/student/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@student.edu",
  "department": "Computer Science",
  "gpa": 3.5,
  "password": "password123"
}
```

### Course Endpoints

#### Get All Courses
```http
GET /api/courses
Authorization: Bearer <token>
```

#### Create Course (Admin)
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_code": "CS101",
  "course_name": "Introduction to Programming",
  "department": "Computer Science",
  "instructor": "Dr. Smith",
  "seat_capacity": 50,
  "time_slot": "Mon/Wed 9:00-10:30",
  "description": "Basic programming concepts"
}
```

#### Update Course (Admin)
```http
PUT /api/courses/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Course (Admin)
```http
DELETE /api/courses/:id
Authorization: Bearer <token>
```

### Preference Endpoints

#### Get Student Preferences
```http
GET /api/preferences
Authorization: Bearer <token>
```

#### Submit Preferences
```http
POST /api/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": [
    { "course_id": 1, "preference_rank": 1 },
    { "course_id": 2, "preference_rank": 2 },
    { "course_id": 3, "preference_rank": 3 }
  ]
}
```

### Allocation Endpoints

#### Run Allocation (Admin)
```http
POST /api/allocation/run
Authorization: Bearer <token>
```

#### Get Allocation Results (Student)
```http
GET /api/allocation/results
Authorization: Bearer <token>
```

### Report Endpoints (Admin)

#### Enrollment Report
```http
GET /api/reports/enrollment
Authorization: Bearer <token>
```

#### Course Demand Analysis
```http
GET /api/reports/demand
Authorization: Bearer <token>
```

#### Unallocated Students
```http
GET /api/reports/unallocated
Authorization: Bearer <token>
```

#### Dashboard Analytics
```http
GET /api/reports/analytics
Authorization: Bearer <token>
```

## 🔄 Allocation Algorithm

The system uses a **Priority-based Weighted Preference Matching** algorithm:

### Algorithm Steps:

1. **Sort Students**: Students are sorted by GPA (descending) to establish priority
2. **Iterate Preferences**: For each student, process their ranked preferences in order
3. **Validation Checks**:
   - Seat availability
   - Prerequisite completion
   - Time slot conflicts
4. **Allocation**: Assign the highest-ranked available course
5. **Update Counts**: Increment enrolled count for allocated courses
6. **Repeat**: Continue until all students are processed

### Fairness Policies:
- Higher GPA students get priority
- Prerequisites must be satisfied
- No time slot conflicts allowed
- Transparent allocation process
- Detailed allocation reports

## 📊 Database Schema

### Tables:
- `students` - Student information and credentials
- `admins` - Admin user credentials
- `courses` - Course details and capacity
- `prerequisites` - Course prerequisite relationships
- `preferences` - Student course preferences
- `enrollments` - Final course allocations
- `system_settings` - System configuration

## 🎨 UI Pages

### Student Pages:
1. **Login** - Authentication
2. **Dashboard** - Overview and quick actions
3. **Course Catalog** - Browse and search courses
4. **Preference Submission** - Drag & drop ranking interface
5. **Allocation Results** - View assigned courses

### Admin Pages:
1. **Login** - Admin authentication
2. **Dashboard** - Analytics and quick actions
3. **Course Management** - CRUD operations for courses
4. **Reports** - Comprehensive analytics and reports

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- SQL injection prevention
- Input validation
- CORS configuration

## 🧪 Testing

### Test the System:

1. **Login as Student**
   - Browse courses
   - Submit preferences
   - View results after allocation

2. **Login as Admin**
   - Create/edit courses
   - Run allocation algorithm
   - View reports and analytics

3. **Test Allocation**
   - Create multiple students
   - Submit various preferences
   - Run allocation
   - Verify fair distribution

## 📝 Project Structure

```
course-allocation-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   ├── package.json
│   └── index.html
├── database/
│   └── schema.sql           # Database schema
└── README.md
```

## 🚧 Future Enhancements

- Email notifications for allocation results
- Waitlist management
- Course prerequisites tracking from enrollment history
- Advanced conflict resolution
- Multi-semester planning
- Student feedback system
- Mobile responsive improvements
- Export reports to PDF/Excel
- Real-time updates with WebSockets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for educational purposes.

## 👨‍💻 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for educational institutions**
