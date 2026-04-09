const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('course_allocation.db');

const query = (sql) => new Promise((resolve, reject) => {
  database.all(sql, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

(async () => {
  try {
    console.log('\n=== COURSES ===');
    const courses = await query('SELECT id, course_code, course_name, year_of_study, course_type, section FROM courses');
    courses.forEach(c => {
      console.log(`[${c.id}] ${c.course_code} - ${c.course_name} (Year ${c.year_of_study}, Type: ${c.course_type}, Section: ${c.section})`);
    });

    console.log('\n=== STUDENTS ===');
    const students = await query('SELECT id, name, year_of_study, cgpa FROM students');
    students.forEach(s => {
      console.log(`[${s.id}] ${s.name} (Year ${s.year_of_study}, CGPA ${s.cgpa})`);
    });

    console.log('\n=== PREFERENCES ===');
    const prefs = await query(`
      SELECT p.student_id, s.name, p.course_id, c.course_code, p.preference_rank 
      FROM preferences p
      JOIN students s ON p.student_id = s.id
      JOIN courses c ON p.course_id = c.id
      ORDER BY p.student_id, p.preference_rank
    `);
    if(prefs.length === 0) {
      console.log('(No preferences found)');
    } else {
      prefs.forEach(p => {
        console.log(`Student ${p.student_id} (${p.name}): Rank ${p.preference_rank} -> Course ${p.course_id} (${p.course_code})`);
      });
    }

    database.close();
  } catch(e) {
    console.error('Error:', e);
    database.close();
  }
})();
