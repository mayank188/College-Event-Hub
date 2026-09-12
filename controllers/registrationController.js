const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * API 9: POST /api/events/:id/register
 * Register the authenticated user for an event.
 *
 * The userId is determined from the Firebase token, NOT from the request body.
 * If the user is already registered, return 409 Conflict.
 */
const registerForEvent = async (req, res, next) => {
  try {
    // Step 1: Find the authenticated user's MongoDB document
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return sendError(res, 404, 'User profile not found. Please create a profile first using POST /api/users');
    }

    // Step 2: Check if the event exists
    const event = await Event.findById(req.params.id);
    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    // Step 3: Check for duplicate registration
    const existingRegistration = await Registration.findOne({
      eventId: event._id,
      userId: user._id,
    });

    if (existingRegistration) {
      return sendError(res, 409, 'User is already registered for this event');
    }

    // Step 4: Create registration
    const registration = await Registration.create({
      eventId: event._id,
      userId: user._id,
    });

    return sendSuccess(res, 201, 'Event registration successful', registration.toJSON());
  } catch (error) {
    // Handle the case where the unique index catches a race condition duplicate
    if (error.code === 11000) {
      return sendError(res, 409, 'User is already registered for this event');
    }
    next(error);
  }
};

/**
 * API 10: GET /api/events/:id/registrations
 * Get all registrations for a specific event.
 *
 * Authorization: Only the event creator can view registrations.
 */
const getEventRegistrations = async (req, res, next) => {
  try {
    // Find the authenticated user
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return sendError(res, 404, 'User profile not found');
    }

    // Find the event
    const event = await Event.findById(req.params.id);
    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    // Authorization: only event creator can view registrations
    if (event.createdBy.toString() !== user._id.toString()) {
      return sendError(res, 403, 'Only the event creator can view registrations');
    }

    // Fetch registrations and populate user details
    const registrations = await Registration.find({ eventId: event._id })
      .populate('userId', 'name email college department')
      .sort({ registeredAt: -1 });

    return sendSuccess(res, 200, 'Registrations retrieved successfully', registrations);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerForEvent, getEventRegistrations };