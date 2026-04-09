-- Automated Student Course Allocation System Database Schema

-- Drop existing tables
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS preferences CASCADE;
DROP TABLE IF EXISTS prerequisites CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    cgpa DECIMAL(4,2) CHECK (cgpa >= 0 AND cgpa <= 10.0),
    year_of_study INTEGER CHECK (year_of_study >= 1 AND year_of_study <= 4),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    instructor VARCHAR(255),
    section VARCHAR(10),
    course_type VARCHAR(50) DEFAULT 'elective' CHECK (course_type IN ('core', 'elective', 'open')),
    seat_capacity INTEGER NOT NULL CHECK (seat_capacity > 0),
    enrolled_count INTEGER DEFAULT 0 CHECK (enrolled_count >= 0),
    time_slot VARCHAR(100) NOT NULL,
    year_of_study INTEGER CHECK (year_of_study >= 1 AND year_of_study <= 4),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_code, section)
);

-- Prerequisites table
CREATE TABLE prerequisites (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(course_id, prerequisite_course_id)
);

-- Completed Courses table (tracks courses student has already taken)
CREATE TABLE completed_courses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    completed_semester VARCHAR(50),
    grade VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- Preferences table
CREATE TABLE preferences (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    preference_rank INTEGER NOT NULL CHECK (preference_rank > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id),
    UNIQUE(student_id, preference_rank)
);

-- Enrollments table
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    allocation_status VARCHAR(20) DEFAULT 'allocated' CHECK (allocation_status IN ('allocated', 'waitlist', 'dropped')),
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- System settings table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_department ON students(department);
CREATE INDEX idx_students_year ON students(year_of_study);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_courses_year ON courses(year_of_study);
CREATE INDEX idx_preferences_student ON preferences(student_id);
CREATE INDEX idx_preferences_course ON preferences(course_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_completed_courses_student ON completed_courses(student_id);
CREATE INDEX idx_completed_courses_course ON completed_courses(course_id);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
('preference_deadline', '2026-12-31T23:59:59'),
('allocation_enabled', 'true'),
('max_preferences', '10');

-- Sample data for testing
-- Insert sample admin (password: admin123)
INSERT INTO admins (name, email, password_hash) VALUES
('System Admin', 'admin@university.edu', '$2b$10$rKZLvXZnJZ8qXqxqxqxqxOqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq');

-- Insert sample courses
INSERT INTO courses (course_code, course_name, department, instructor, section, course_type, seat_capacity, time_slot, year_of_study, description) VALUES
('CS101', 'Machine Learning', 'Computer Science', 'Dr. Jhansi Lakshmi', 'A', 'elective', 50, 'Mon/Wed 9:00-10:30', 3, 'Basic programming concepts'),
('CS101', 'Machine Learning', 'Computer Science', 'Dr. Jhansi Lakshmi', 'B', 'elective', 50, 'Tue/Thu 9:00-10:30', 3, 'Basic programming concepts'),
('CS201', 'Artificial Intelligence', 'Computer Science', 'Dr.Rajesh', 'A', 'elective', 40, 'Tue/Thu 10:00-11:30', 3, 'Advanced data structures'),
('CS201', 'Artificial Intelligence', 'Computer Science', 'Dr.Rajesh', 'B', 'elective', 40, 'Mon/Wed 10:00-11:30', 3, 'Advanced data structures'),
('CS301', 'Advance Java Programming', 'Computer Science', 'Dr. Ravi Kishore', 'A', 'elective', 35, 'Mon/Wed 14:00-15:30', 3, 'Algorithm design and analysis'),
('MATH101', 'Advance Data Structures', 'Computer Science', 'Dr.Brahmma Naidu', 'A', 'elective', 60, 'Mon/Wed/Fri 11:00-12:00', 2, 'Differential calculus'),
('MATH201', 'Linear Algebra', 'Mathematics', 'Dr. Narayana', 'A', 'elective', 45, 'Tue/Thu 13:00-14:30', 2, 'Matrices and vector spaces'),
('PHY101', 'Physics I', 'Physics', 'Dr. Ravi Kumar', 'A', 'elective', 50, 'Tue/Thu 9:00-10:30', 2, 'Mechanics and thermodynamics'),
('ENG101', 'English Composition', 'English', 'Dr. Prabha', 'A', 'elective', 40, 'Mon/Wed 10:00-11:30', 2, 'Writing and composition'),
('HIST101', 'World History', 'History', 'Dr. Anderson', 'A', 'elective', 55, 'Tue/Thu 14:00-15:30', 2, 'Global historical perspectives');

-- Insert prerequisites
INSERT INTO prerequisites (course_id, prerequisite_course_id) VALUES
((SELECT id FROM courses WHERE course_code = 'CS201' AND section = 'A' LIMIT 1), (SELECT id FROM courses WHERE course_code = 'CS101' AND section = 'A' LIMIT 1)),
((SELECT id FROM courses WHERE course_code = 'CS301' AND section = 'A' LIMIT 1), (SELECT id FROM courses WHERE course_code = 'CS201' AND section = 'A' LIMIT 1)),
((SELECT id FROM courses WHERE course_code = 'MATH201' AND section = 'A' LIMIT 1), (SELECT id FROM courses WHERE course_code = 'MATH101' AND section = 'A' LIMIT 1));

-- Insert sample students (password: student123)
INSERT INTO students (name, email, department, cgpa, year_of_study, password_hash) VALUES
('K N S Hari Chandana', 'hari@gmail.com', 'Computer Science', 7.99, 3, '$2b$10$rKZLvXZnJZ8qXqxqxqxqxOqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq'),
('G SivaMani', 'siva@gmail.com', 'Computer Science', 8.21, 3, '$2b$10$rKZLvXZnJZ8qXqxqxqxqxOqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq'),
('M Nikhitha', 'nikki@gmail.com', 'Mathematics', 8.03, 2, '$2b$10$rKZLvXZnJZ8qXqxqxqxqxOqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq'),
('D Sarayu', 'saru@gmail.com', 'Physics', 7.99, 2, '$2b$10$rKZLvXZnJZ8qXqxqxqxqxOqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq'),
('K Kedareswar', 'KD@gmail.com', 'Computer Science', 9.0, 3, '$2b$10$rKZLvXZnJZ8qXqxqxqxqxOqxqxqxqxqxqxqxqxqxqxqxqxqxqxqxq');


ALTER TABLE students
RENAME COLUMN password_hash TO password;
UPDATE students SET password='231FA04H02' WHERE email='hari@gmail.com';
UPDATE students SET password='231FA04409' WHERE email='siva@gmail.com';
UPDATE students SET password='231FA04C43' WHERE email='nikki@gmail.com';
UPDATE students SET password='231FA04D96' WHERE email='saru@gmail.com';