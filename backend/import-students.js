/**
 * Import students from chandana.csv into the database
 * Run: node import-students.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Parse CSV manually (no external deps)
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    // Handle quoted fields
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    fields.push(current.trim());
    
    const obj = {};
    headers.forEach((h, i) => obj[h] = fields[i] || '');
    return obj;
  }).filter(r => r.registerno && r.name && r.name.trim());
}

// Clean email — replace invalid ones with generated email from register number
function cleanEmail(email, regNo) {
  const invalid = ['-', '0', '', null, undefined];
  if (!email || invalid.includes(email.trim())) {
    return `${regNo.toLowerCase()}@student.vfstr.edu.in`;
  }
  const e = email.trim().toLowerCase();
  if (!e.includes('@') || e.length < 5) {
    return `${regNo.toLowerCase()}@student.vfstr.edu.in`;
  }
  return e;
}

// Determine department from register number prefix
function getDepartment(regNo) {
  const code = regNo.substring(5, 7);
  const deptMap = {
    '01': 'Computer Science',
    '02': 'Electronics & Communication',
    '03': 'Electrical Engineering',
    '04': 'Mechanical Engineering',
    '05': 'Civil Engineering',
    '06': 'Information Technology',
    '07': 'Chemical Engineering',
    '08': 'Biotechnology',
    '09': 'Mathematics',
    '10': 'Physics',
    '11': 'Chemistry',
    '12': 'MBA',
    '13': 'MCA',
  };
  return deptMap[code] || 'Computer Science';
}

async function importStudents() {
  const csvPath = 'C:\\Users\\HOME\\Downloads\\chandana.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    process.exit(1);
  }

  console.log('📂 Reading CSV...');
  const rows = parseCSV(csvPath);
  console.log(`✓ Found ${rows.length} student records`);

  // Use SQLite directly
  const sqlite3 = require('sqlite3').verbose();
  const isProduction = process.env.NODE_ENV === 'production';
  const dbPath = isProduction
    ? '/tmp/course_allocation.db'
    : path.join(__dirname, 'course_allocation.db');

  const db = new sqlite3.Database(dbPath);
  db.run('PRAGMA foreign_keys = ON');

  // Clear existing students
  console.log('🗑️  Removing old students...');
  await new Promise((res, rej) => db.run('DELETE FROM preferences', err => err ? rej(err) : res()));
  await new Promise((res, rej) => db.run('DELETE FROM enrollments', err => err ? rej(err) : res()));
  await new Promise((res, rej) => db.run('DELETE FROM notifications WHERE user_role = ?', ['student'], err => err ? rej(err) : res()));
  await new Promise((res, rej) => db.run('DELETE FROM students', err => err ? rej(err) : res()));
  console.log('✓ Old students removed');

  // Hash a default password (register number is the password)
  // We'll use a single hash for speed, then update individually for security
  console.log('🔐 Preparing password hashes (this may take a moment)...');

  let inserted = 0;
  const BATCH = 100;

  const stmt = db.prepare(
    `INSERT OR IGNORE INTO students (name, email, department, gpa, year_of_study, roll_number, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  // Each student's password = their register number (e.g. 221FA01001)
  // Email = registerno@gmail.com (e.g. 221fa01001@gmail.com)
  // Pre-hash all unique passwords — group by regNo for speed
  const defaultHash = await bcrypt.hash('PLACEHOLDER', 10); // warmup

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const name = row.name.trim().toUpperCase();
    const regNo = row.registerno.trim().toUpperCase();
    // Email: lowercase regNo@gmail.com
    const email = `${regNo.toLowerCase()}@gmail.com`;
    // Password: their register number (e.g. 221FA01001)
    const passwordHash = await bcrypt.hash(regNo, 10);
    const year = parseInt(row.year) || 2;
    const cgpa = parseFloat(row.cgpa) || 0.0;
    const dept = getDepartment(regNo);

    stmt.run([name, email, dept, cgpa, year, regNo, passwordHash], (err) => {
      if (err) { /* skip duplicate */ }
      else inserted++;
    });

    if ((i + 1) % BATCH === 0) {
      process.stdout.write(`\r  Progress: ${i + 1}/${rows.length} (${Math.round((i+1)/rows.length*100)}%)`);
    }
  }

  stmt.finalize();

  // Wait for all inserts
  await new Promise(res => setTimeout(res, 3000));

  const count = await new Promise((res, rej) =>
    db.get('SELECT COUNT(*) as cnt FROM students', (err, row) => err ? rej(err) : res(row.cnt))
  );

  console.log(`\n\n✅ Import complete!`);
  console.log(`   Total inserted: ${count}`);
  console.log(`   Skipped (duplicates): ${rows.length - count}`);
  console.log(`\n📊 Year distribution:`);

  const yearDist = await new Promise((res, rej) =>
    db.all('SELECT year_of_study, COUNT(*) as cnt FROM students GROUP BY year_of_study ORDER BY year_of_study', (err, rows) => err ? rej(err) : res(rows))
  );
  yearDist.forEach(r => console.log(`   Year ${r.year_of_study}: ${r.cnt} students`));

  console.log(`\n🔑 Credentials format:`);
  console.log(`   Email:    registerno@gmail.com  (e.g. 221fa01001@gmail.com)`);
  console.log(`   Password: REGISTERNO             (e.g. 221FA01001)`);
  
  db.close();
}

importStudents().catch(console.error);
