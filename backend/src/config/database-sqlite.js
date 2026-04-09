const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite database file path
const dbPath = path.join(__dirname, '../../course_allocation.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(-1);
  }
  console.log('✓ SQLite database connected successfully');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database schema
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    const schema = `
      -- Students table
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        gpa REAL CHECK (gpa >= 0 AND gpa <= 10.0),
        year_of_study INTEGER DEFAULT 2 CHECK (year_of_study >= 1 AND year_of_study <= 4),
        roll_number TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Admins table
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Courses table
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_code TEXT NOT NULL,
        course_name TEXT NOT NULL,
        department TEXT NOT NULL,
        instructor TEXT,
        section TEXT DEFAULT 'A',
        course_type TEXT DEFAULT 'elective' CHECK (course_type IN ('core', 'elective', 'open')),
        seat_capacity INTEGER NOT NULL CHECK (seat_capacity > 0),
        enrolled_count INTEGER DEFAULT 0 CHECK (enrolled_count >= 0),
        time_slot TEXT NOT NULL,
        year_of_study INTEGER DEFAULT 2 CHECK (year_of_study >= 1 AND year_of_study <= 4),
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_code, section)
      );

      -- Completed courses (courses student already finished in previous semesters)
      CREATE TABLE IF NOT EXISTS completed_courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        completed_semester TEXT,
        grade TEXT,
        UNIQUE(student_id, course_id)
      );

      -- Preferences table
      CREATE TABLE IF NOT EXISTS preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        preference_rank INTEGER NOT NULL CHECK (preference_rank > 0),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id),
        UNIQUE(student_id, preference_rank)
      );

      -- Enrollments table (one elective per student)
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        allocation_status TEXT DEFAULT 'allocated' CHECK (allocation_status IN ('allocated', 'waitlist', 'dropped')),
        allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id)
      );

      -- System settings table
      CREATE TABLE IF NOT EXISTS system_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_role TEXT NOT NULL CHECK (user_role IN ('student', 'admin')),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_role);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
      CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
      CREATE INDEX IF NOT EXISTS idx_students_year ON students(year_of_study);
      CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
      CREATE INDEX IF NOT EXISTS idx_courses_year ON courses(year_of_study);
      CREATE INDEX IF NOT EXISTS idx_preferences_student ON preferences(student_id);
      CREATE INDEX IF NOT EXISTS idx_preferences_course ON preferences(course_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
      CREATE INDEX IF NOT EXISTS idx_completed_courses_student ON completed_courses(student_id);
      CREATE INDEX IF NOT EXISTS idx_completed_courses_course ON completed_courses(course_id);
    `;

    db.exec(schema, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✓ Database schema initialized');
        resolve();
      }
    });
  });
};

// Insert sample data
const insertSampleData = async () => {
  return new Promise((resolve, reject) => {
    // Check if data already exists
    db.get('SELECT COUNT(*) as count FROM courses', async (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count > 0) {
        console.log('✓ Sample data already exists');
        resolve();
        return;
      }

      console.log('Inserting sample data...');

      const bcrypt = require('bcrypt');
      const adminHash = await bcrypt.hash('admin123', 10);

      // Pre-hash all student passwords
      const studentData = [
        ['K N S Hari Chandana', 'hari@gmail.com', 'Computer Science', 7.99, 3, await bcrypt.hash('231FA04H02', 10)],
        ['G SivaMani', 'siva@gmail.com', 'Computer Science', 8.21, 3, await bcrypt.hash('231FA04409', 10)],
        ['M Nikhitha', 'nikki@gmail.com', 'Mathematics', 8.03, 2, await bcrypt.hash('231FA04C43', 10)],
        ['D Sarayu', 'saru@gmail.com', 'Physics', 7.99, 2, await bcrypt.hash('231FA04D96', 10)],
        ['K Kedareswar', 'KD@gmail.com', 'Computer Science', 9.0, 3, await bcrypt.hash('student123', 10)],
      ];

      db.serialize(() => {
        db.run(`INSERT INTO system_settings (setting_key, setting_value) VALUES ('preference_deadline', '2026-12-31T23:59:59')`);
        db.run(`INSERT INTO system_settings (setting_key, setting_value) VALUES ('allocation_enabled', 'true')`);
        db.run(`INSERT INTO system_settings (setting_key, setting_value) VALUES ('max_preferences', '10')`);

        db.run(`INSERT INTO admins (name, email, password_hash) VALUES ('System Admin', 'admin@university.edu', ?)`, [adminHash]);

        const courses = [
          ['CS101', 'Machine Learning', 'Computer Science', 'Dr. Jhansi Lakshmi', 'A', 'elective', 50, 'Mon/Wed 9:00-10:30', 3, 'Basic programming concepts'],
          ['CS101', 'Machine Learning', 'Computer Science', 'Dr. Jhansi Lakshmi', 'B', 'elective', 50, 'Tue/Thu 9:00-10:30', 3, 'Basic programming concepts'],
          ['CS201', 'Artificial Intelligence', 'Computer Science', 'Dr. Rajesh', 'A', 'elective', 40, 'Tue/Thu 10:00-11:30', 3, 'Advanced data structures'],
          ['CS201', 'Artificial Intelligence', 'Computer Science', 'Dr. Rajesh', 'B', 'elective', 40, 'Mon/Wed 10:00-11:30', 3, 'Advanced data structures'],
          ['CS301', 'Advance Java Programming', 'Computer Science', 'Dr. Ravi Kishore', 'A', 'elective', 35, 'Mon/Wed 14:00-15:30', 3, 'Algorithm design and analysis'],
          ['MATH101', 'Advance Data Structures', 'Computer Science', 'Dr. Brahmma Naidu', 'A', 'elective', 60, 'Mon/Wed/Fri 11:00-12:00', 2, 'Differential calculus'],
          ['MATH201', 'Linear Algebra', 'Mathematics', 'Dr. Narayana', 'A', 'elective', 45, 'Tue/Thu 13:00-14:30', 2, 'Matrices and vector spaces'],
          ['PHY101', 'Physics I', 'Physics', 'Dr. Ravi Kumar', 'A', 'elective', 50, 'Tue/Thu 9:00-10:30', 2, 'Mechanics and thermodynamics'],
          ['ENG101', 'English Composition', 'English', 'Dr. Prabha', 'A', 'elective', 40, 'Mon/Wed 10:00-11:30', 2, 'Writing and composition'],
          ['HIST101', 'World History', 'History', 'Dr. Anderson', 'A', 'elective', 55, 'Tue/Thu 14:00-15:30', 2, 'Global historical perspectives'],
        ];
        courses.forEach(c => db.run(
          `INSERT INTO courses (course_code, course_name, department, instructor, section, course_type, seat_capacity, time_slot, year_of_study, description) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          c
        ));

        studentData.forEach(s => db.run(
          `INSERT INTO students (name, email, department, gpa, year_of_study, password_hash) VALUES (?,?,?,?,?,?)`,
          s
        ));

        db.run(`SELECT 1`, (err) => {
          if (err) { reject(err); } else { console.log('✓ Sample data inserted'); resolve(); }
        });
      });
    });
  });
};

// Promisify database methods
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve({ rows });
    });
  });
};

const queryOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve({ rows: row ? [row] : [] });
    });
  });
};

const execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ rows: [{ id: this.lastID }], rowCount: this.changes });
    });
  });
};

// Initialize database on startup
(async () => {
  try {
    await initializeDatabase();
    await insertSampleData();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
})();

module.exports = {
  query,
  queryOne,
  execute,
  db
};
