require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'course_allocation.db');
const db = new sqlite3.Database(dbPath);
db.run('PRAGMA foreign_keys = ON');

async function run() {
  const content = fs.readFileSync('C:\\Users\\HOME\\Downloads\\chandana.csv', 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  // Filter only 231FA04... students
  const students = [];
  for (const line of lines.slice(1)) {
    const fields = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) { fields.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    fields.push(cur.trim());
    const regNo = fields[0]?.trim().toUpperCase();
    if (!regNo || !regNo.startsWith('231FA04')) continue;
    students.push({ regNo, name: fields[1]?.trim().toUpperCase(), year: parseInt(fields[3]) || 3, cgpa: parseFloat(fields[4]) || 0 });
  }

  console.log(`Found ${students.length} students with 231FA04 prefix`);

  // Pre-hash all passwords using regNo as password
  // For speed: hash each regNo individually (they're all different)
  // Use bcrypt rounds=8 for speed (still secure enough)
  console.log('Hashing passwords...');
  const ROUNDS = 8;

  const stmt = db.prepare(
    `INSERT OR REPLACE INTO students (name, email, department, gpa, year_of_study, roll_number, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  let done = 0;
  for (const s of students) {
    const email = `${s.regNo.toLowerCase()}@gmail.com`;
    const hash = await bcrypt.hash(s.regNo, ROUNDS);
    stmt.run([s.name, email, 'Computer Science', s.cgpa, s.year, s.regNo, hash]);
    done++;
    if (done % 100 === 0) process.stdout.write(`\r  ${done}/${students.length}`);
  }
  stmt.finalize();

  await new Promise(r => setTimeout(r, 2000));

  const count = await new Promise((res, rej) =>
    db.get('SELECT COUNT(*) as cnt FROM students WHERE roll_number LIKE ?', ['231FA04%'], (e, r) => e ? rej(e) : res(r.cnt))
  );

  console.log(`\n✅ Done! ${count} students with 231FA04 in DB`);
  console.log('Login: 231fa04h02@gmail.com / 231FA04H02');
  db.close();
}

run().catch(console.error);
