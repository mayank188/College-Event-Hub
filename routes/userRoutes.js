const express = require('express');
const router = express.Router();
const { createUser, getUserById } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateCreateUser, validateObjectId } = require('../middleware/validateMiddleware');

/**
 * User Routes
 *
 * POST /api/users      → Create user profile (API 1)
 * GET  /api/users/:id  → Get user by ID (API 2)
 *
 * All routes require Firebase authentication.
 */

// API 1: Create user profile
router.post('/', authenticate, validateCreateUser, createUser);

// API 2: Get user by ID
router.get('/:id', authenticate, validateObjectId('id'), getUserById);

module.exports = router;