// server-production.js - Production Server that serves both API and Frontend

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import database connection
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
console.log('🔧 Loading auth routes...');
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/sharing', require('./routes/sharing'));
app.use('/api/health', require('./routes/health')); // Health check endpoints

// API endpoints
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '📚 Welcome to StudySync API',
    version: '1.0.0',
    description: 'A Notes & Resource Organizer API',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password/:token': 'Reset password with token',
        'POST /api/auth/change-password': 'Change password'
      },
      subjects: {
        'GET /api/subjects': 'Get all subjects',
        'POST /api/subjects': 'Create new subject',
        'GET /api/subjects/:id': 'Get subject by ID',
        'PUT /api/subjects/:id': 'Update subject',
        'DELETE /api/subjects/:id': 'Delete subject'
      },
      notes: {
        'GET /api/notes/:subjectId': 'Get notes for a subject',
        'POST /api/notes': 'Create new note',
        'GET /api/notes/note/:id': 'Get note by ID',
        'PUT /api/notes/:id': 'Update note',
        'DELETE /api/notes/:id': 'Delete note',
        'PATCH /api/notes/:id/pin': 'Toggle pin status'
      }
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '✅ StudySync API is healthy!',
    environment: process.env.NODE_ENV || 'development',
    database: 'Connected to MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Serve React app (production build)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Handle React Router routes - serve index.html for any non-API routes
app.use((req, res, next) => {
  // If it's an API route, let it continue to 404 handler
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // For all non-API routes, serve the React app
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Handle 404 for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.path} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 StudySync Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Full app available at: http://localhost:${PORT}`);
  console.log(`🔗 API endpoints at: http://localhost:${PORT}/api`);
  console.log(`📊 Database: MongoDB Local`);
  console.log('');
  console.log('🎯 Open your browser to: http://localhost:5000');
  console.log('');
});