// Helper script to generate password hashes for admin and student users
const bcrypt = require('bcrypt');

const users = [
  { role: 'Admin', email: 'admin@university.edu', password: 'admin123' },
  { role: 'Student', email: 'alice@student.edu', password: 'student123' },
  { role: 'Student', email: 'bob@student.edu', password: 'student123' },
];

console.log('Generating password hashes...\n');

users.forEach(async (user) => {
  const hash = await bcrypt.hash(user.password, 10);
  console.log(`${user.role} - ${user.email}`);
  console.log(`Password: ${user.password}`);
  console.log(`Hash: ${hash}\n`);
});

console.log('Copy these hashes to your database schema or use SQL UPDATE commands.');
