const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEvents,
} = require('../controllers/eventController');
const { registerForEvent, getEventRegistrations } = require('../controllers/registrationController');
const { authenticate } = require('../middleware/authMiddleware');
const {
  validateCreateEvent,
  validateUpdateEvent,
  validateObjectId,
} = require('../middleware/validateMiddleware');

/**
 * Event Routes
 *
 * IMPORTANT: The /search route MUST be defined BEFORE /:id routes.
 * Otherwise Express would treat "search" as an event ID parameter.
 *
 * Route order:
 *   POST   /api/events           → Create event (API 3)
 *   GET    /api/events           → Get all events (API 4)
 *   GET    /api/events/search    → Search events (API 8) ← BEFORE /:id
 *   GET    /api/events/:id       → Get event by ID (API 5)
 *   PUT    /api/events/:id       → Update event (API 6)
 *   DELETE /api/events/:id       → Delete event (API 7)
 *   POST   /api/events/:id/register       → Register for event (API 9)
 *   GET    /api/events/:id/registrations  → Get event registrations (API 10)
 */

// API 3: Create event
router.post('/', authenticate, validateCreateEvent, createEvent);

// API 4: Get all events
router.get('/', authenticate, getAllEvents);

// API 8: Search events — MUST come BEFORE /:id
router.get('/search', authenticate, searchEvents);

// API 5: Get event by ID
router.get('/:id', authenticate, validateObjectId('id'), getEventById);

// API 6: Update event
router.put('/:id', authenticate, validateObjectId('id'), validateUpdateEvent, updateEvent);

// API 7: Delete event
router.delete('/:id', authenticate, validateObjectId('id'), deleteEvent);

// API 9: Register for event
router.post('/:id/register', authenticate, validateObjectId('id'), registerForEvent);

// API 10: Get event registrations
router.get('/:id/registrations', authenticate, validateObjectId('id'), getEventRegistrations);

module.exports = router;