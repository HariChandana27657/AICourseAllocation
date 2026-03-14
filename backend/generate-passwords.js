// Generate password hashes and update database
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const users = [
  { role: 'Admin', email: 'admin@university.edu', password: 'admin123', table: 'admins' },
  { role: 'Student', email: 'alice@student.edu', password: 'student123', table: 'students' },
  { role: 'Student', email: 'bob@student.edu', password: 'student123', table: 'students' },
  { role: 'Student', email: 'carol@student.edu', password: 'student123', table: 'students' },
  { role: 'Student', email: 'david@student.edu', password: 'student123', table: 'students' },
  { role: 'Student', email: 'emma@student.edu', password: 'student123', table: 'students' },
];

console.log('========================================');
console.log('Password Hash Generator');
console.log('========================================\n');

const generateHashes = async () => {
  const hashes = [];
  
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    hashes.push({ ...user, hash });
    console.log(`${user.role} - ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log(`Hash: ${hash}\n`);
  }

  // Check if using SQLite or PostgreSQL
  const useSQLite = process.env.USE_SQLITE === 'true' || fs.existsSync(path.join(__dirname, 'course_allocation.db'));

  if (useSQLite) {
    console.log('Detected SQLite database. Updating...\n');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(path.join(__dirname, 'course_allocation.db'));

    for (const user of hashes) {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE ${user.table} SET password_hash = ? WHERE email = ?`,
          [user.hash, user.email],
          (err) => {
            if (err) {
              console.error(`Error updating ${user.email}:`, err);
              reject(err);
            } else {
              console.log(`✓ Updated ${user.email}`);
              resolve();
            }
          }
        );
      });
    }

    db.close();
    console.log('\n✓ All passwords updated in SQLite database!');
  } else {
    console.log('========================================');
    console.log('PostgreSQL Update Commands:');
    console.log('========================================\n');
    console.log('Run these SQL commands in psql:\n');
    
    for (const user of hashes) {
      console.log(`UPDATE ${user.table} SET password_hash = '${user.hash}' WHERE email = '${user.email}';`);
    }
    
    console.log('\nOr run: psql -U postgres -d course_allocation -f update_passwords.sql');
    
    // Create SQL file
    const sqlContent = hashes.map(user => 
      `UPDATE ${user.table} SET password_hash = '${user.hash}' WHERE email = '${user.email}';`
    ).join('\n');
    
    fs.writeFileSync(path.join(__dirname, 'update_passwords.sql'), sqlContent);
    console.log('\n✓ SQL file created: backend/update_passwords.sql');
  }

  console.log('\n========================================');
  console.log('Login Credentials:');
  console.log('========================================');
  console.log('\nStudent Login:');
  console.log('  Email: alice@student.edu');
  console.log('  Password: student123');
  console.log('\nAdmin Login:');
  console.log('  Email: admin@university.edu');
  console.log('  Password: admin123');
  console.log('\n========================================\n');
};

generateHashes().catch(console.error);
