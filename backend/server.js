const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Use SQLite if USE_SQLITE is set or PostgreSQL is not available
const useSQLite = process.env.USE_SQLITE === 'true';
const pool = useSQLite 
  ? require('./src/config/database-sqlite')
  : require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const preferenceRoutes = require('./src/routes/preferenceRoutes');
const allocationRoutes = require('./src/routes/allocationRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Course Allocation System API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Course Allocation System - Backend Server               ║
║   Server running on port ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║   Database: ${useSQLite ? 'SQLite' : 'PostgreSQL'}                                  ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

module.exports = app;
