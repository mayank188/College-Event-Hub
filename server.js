// Load environment variables from .env file FIRST before anything else
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { initializeFirebase } = require('./config/firebase');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

// Import route files
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Create Express application
const app = express();

// ---------------------
// Security Middleware
// ---------------------
// We configure helmet, but disable some Content Security Policy (CSP) options 
// so that our frontend can load the Firebase Client SDK directly from the CDN safely.
app.use(
  helmet({
    contentSecurityPolicy: false, 
  })
);

// CORS allows requests from other origins (needed for frontend apps or Postman)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json({ limit: '10kb' }));

// ---------------------
// Serve Static Frontend
// ---------------------
// This serves the public folder as static files. When you go to http://localhost:5000/
// it will automatically load public/index.html.
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------
// API Routes
// ---------------------
// All user-related routes start with /api/users
app.use('/api/users', userRoutes);

// All event-related routes start with /api/events
app.use('/api/events', eventRoutes);

// ---------------------
// Error Handling
// ---------------------
// Handle requests to undefined routes (404) - Only for API paths
app.use('/api', notFoundHandler);

// If no static file or route matches, serve index.html (fallback for single-page apps)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized error handler — catches all errors thrown in routes/controllers
app.use(errorHandler);

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Step 1: Connect to MongoDB
    await connectDB();

    // Step 2: Initialize Firebase Admin SDK
    initializeFirebase();

    // Step 3: Start listening for HTTP requests
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🖥️  Frontend Panel: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();