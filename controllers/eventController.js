const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Helper: Find the MongoDB user document for the currently authenticated Firebase user.
 * This is used by multiple controllers to map Firebase UID → MongoDB User.
 */
const findAuthenticatedUser = async (firebaseUid) => {
  return await User.findOne({ firebaseUid });
};

/**
 * API 3: POST /api/events
 * Create a new college event.
 *
 * The `createdBy` field is set to the authenticated user's MongoDB _id,
 * NOT from the request body. This prevents users from creating events
 * on behalf of others.
 */
const createEvent = async (req, res, next) => {
  try {
    // Find the MongoDB user for the authenticated Firebase user
    const user = await findAuthenticatedUser(req.user.uid);
    if (!user) {
      return sendError(res, 404, 'User profile not found. Please create a profile first using POST /api/users');
    }

    const { title, description, college, category, date, venue } = req.body;

    // Create the event with createdBy set from authentication
    const event = await Event.create({
      title,
      description,
      college,
      category,
      date,
      venue,
      createdBy: user._id, // From authenticated user, NOT from request body
    });

    return sendSuccess(res, 201, 'Event created successfully', event.toJSON());
  } catch (error) {
    next(error);
  }
};

/**
 * API 4: GET /api/events
 * Get all events with optional filtering and pagination.
 *
 * Query parameters:
 *   - college: filter by college name
 *   - category: filter by category
 *   - date: filter by date (YYYY-MM-DD)
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10)
 */
const getAllEvents = async (req, res, next) => {
  try {
    const { college, category, date, page = 1, limit = 10 } = req.query;

    // Build the filter object dynamically based on query parameters
    const filter = {};

    if (college) {
      // Case-insensitive match
      filter.college = { $regex: new RegExp(college, 'i') };
    }

    if (category) {
      filter.category = { $regex: new RegExp(category, 'i') };
    }

    if (date) {
      // Filter events on a specific date (from start of day to end of day)
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      if (isNaN(startOfDay.getTime())) {
        return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
      }

      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Parse pagination values
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ date: 1 }) // Sort by date ascending
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email'), // Include creator's name and email
      Event.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limitNum);

    return sendSuccess(res, 200, 'Events retrieved successfully', events, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * API 5: GET /api/events/:id
 * Get a single event by its MongoDB _id.
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    return sendSuccess(res, 200, 'Event retrieved successfully', event.toJSON());
  } catch (error) {
    next(error);
  }
};

/**
 * API 6: PUT /api/events/:id
 * Update an existing event.
 *
 * Authorization: Only the user who created the event can update it.
 * The `createdBy` field cannot be changed by the client.
 */
const updateEvent = async (req, res, next) => {
  try {
    // Find the authenticated user
    const user = await findAuthenticatedUser(req.user.uid);
    if (!user) {
      return sendError(res, 404, 'User profile not found');
    }

    // Find the event
    const event = await Event.findById(req.params.id);
    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    // Authorization check: is this user the event creator?
    if (event.createdBy.toString() !== user._id.toString()) {
      return sendError(res, 403, 'You are not authorized to update this event');
    }

    // Only allow updating specific fields (not createdBy)
    const allowedUpdates = ['title', 'description', 'college', 'category', 'date', 'venue'];
    const updates = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, 'No valid fields to update');
    }

    // Apply updates and return the updated document
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true } // new: true returns the updated document
    ).populate('createdBy', 'name email');

    return sendSuccess(res, 200, 'Event updated successfully', updatedEvent.toJSON());
  } catch (error) {
    next(error);
  }
};

/**
 * API 7: DELETE /api/events/:id
 * Delete an event and all its registrations.
 *
 * Authorization: Only the event creator can delete it.
 * Cascade delete: all registrations for this event are also removed.
 */
const deleteEvent = async (req, res, next) => {
  try {
    // Find the authenticated user
    const user = await findAuthenticatedUser(req.user.uid);
    if (!user) {
      return sendError(res, 404, 'User profile not found');
    }

    // Find the event
    const event = await Event.findById(req.params.id);
    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    // Authorization check
    if (event.createdBy.toString() !== user._id.toString()) {
      return sendError(res, 403, 'You are not authorized to delete this event');
    }

    // Delete all registrations for this event (prevent orphan records)
    await Registration.deleteMany({ eventId: event._id });

    // Delete the event itself
    await Event.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 200, 'Event deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * API 8: GET /api/events/search
 * Search events by keyword, category, college, and/or date.
 *
 * Query parameters:
 *   - q: search keyword (searches title and description)
 *   - category: filter by category
 *   - college: filter by college
 *   - date: filter by date (YYYY-MM-DD)
 */
const searchEvents = async (req, res, next) => {
  try {
    const { q, category, college, date } = req.query;

    // Build the filter
    const filter = {};

    // Text search on title and description
    if (q) {
      filter.$or = [
        { title: { $regex: new RegExp(q, 'i') } },
        { description: { $regex: new RegExp(q, 'i') } },
      ];
    }

    if (category) {
      filter.category = { $regex: new RegExp(category, 'i') };
    }

    if (college) {
      filter.college = { $regex: new RegExp(college, 'i') };
    }

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      if (isNaN(startOfDay.getTime())) {
        return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
      }

      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const events = await Event.find(filter)
      .sort({ date: 1 })
      .populate('createdBy', 'name email');

    const message = events.length > 0
      ? 'Events search completed successfully'
      : 'No events found';

    return sendSuccess(res, 200, message, events);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEvents,
};