const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper function to handle both PostgreSQL and SQLite
const query = async (sql, params) => {
  if (typeof db.query === 'function') {
    // SQLite
    return await db.query(sql, params);
  } else {
    // PostgreSQL
    return await db.query(sql, params);
  }
};

// Generate JWT token
const generateToken = (user, role) => {
  return jwt.sign(
    { id: user.id, email: user.email, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Student login
const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await query(
      'SELECT * FROM students WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const student = result.rows[0];
    const validPassword = await bcrypt.compare(password, student.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(student, 'student');

    res.json({
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        department: student.department,
        gpa: student.gpa,
        yearOfStudy: student.year_of_study,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin, 'admin');

    res.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Student registration
const studentRegister = async (req, res) => {  try {
    const { name, email, department, cgpa, yearOfStudy, password } = req.body;

    if (!name || !email || !department || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (!yearOfStudy || yearOfStudy < 1 || yearOfStudy > 4) {
      return res.status(400).json({ error: 'Year of study must be between 1 and 4' });
    }

    const existingUser = await query(
      'SELECT * FROM students WHERE email = ?',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the student
    if (typeof db.execute === 'function') {
      // SQLite
      const insertResult = await db.execute(
        'INSERT INTO students (name, email, department, cgpa, year_of_study, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, department, cgpa || 0.0, yearOfStudy, hashedPassword]
      );
      
      // Get the inserted student
      const result = await query(
        'SELECT id, name, email, department, cgpa, year_of_study FROM students WHERE id = ?',
        [insertResult.rows[0].id]
      );
      
      const student = result.rows[0];
      const token = generateToken(student, 'student');

      res.status(201).json({
        token,
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          department: student.department,
          gpa: student.gpa,
          yearOfStudy: student.year_of_study,
          role: 'student'
        }
      });
    } else {
      // PostgreSQL
      const result = await query(
        'INSERT INTO students (name, email, department, cgpa, year_of_study, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, department, cgpa, year_of_study',
        [name, email, department, cgpa || 0.0, yearOfStudy, hashedPassword]
      );

      const student = result.rows[0];
      const token = generateToken(student, 'student');

      res.status(201).json({
        token,
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          department: student.department,
          gpa: student.gpa,
          yearOfStudy: student.year_of_study,
          role: 'student'
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

module.exports = {
  studentLogin,
  adminLogin,
  studentRegister,
  adminResetPassword
};

// Admin reset own password
async function adminResetPassword(req, res) {
  try {
    const adminId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const result = await query('SELECT * FROM admins WHERE id = ?', [adminId]);
    const rows = result.rows || result;
    if (rows.length === 0) return res.status(404).json({ error: 'Admin not found' });

    const admin = rows[0];
    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, 10);
    if (typeof db.execute === 'function') {
      await db.execute('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, adminId]);
    } else {
      await db.query('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, adminId]);
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}
