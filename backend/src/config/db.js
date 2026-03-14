// Unified database module - automatically selects SQLite or PostgreSQL
require('dotenv').config();

const useSQLite = process.env.USE_SQLITE === 'true';

let db;

if (useSQLite) {
  console.log('Using SQLite database');
  db = require('./database-sqlite');
} else {
  console.log('Using PostgreSQL database');
  db = require('./database');
}

module.exports = db;
