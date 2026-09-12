const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * API 1: POST /api/users
 * Create a user profile for the authenticated Firebase user.
 *
 * The email comes from the verified Firebase token (req.user.email),
 * NOT from the request body. This ensures the email is authentic.
 *
 * The Firebase UID is stored internally so we can map
 * Firebase accounts to MongoDB user documents.
 */
const createUser = async (req, res, next) => {
  try {
    const { name, college, department } = req.body;

    // Get Firebase UID and email from the verified token
    const firebaseUid = req.user.uid;
    const email = req.user.email;

    if (!email) {
      return sendError(res, 400, 'Firebase account does not have an email address');
    }

    // Check if a profile already exists for this Firebase account
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return sendError(res, 409, 'User profile already exists for this account');
    }

    // Also check if the email is already used (edge case)
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return sendError(res, 409, 'A user with this email already exists');
    }

    // Create the user profile
    const user = await User.create({
      firebaseUid,
      name,
      email,
      college,
      department,
    });

    return sendSuccess(res, 201, 'User registered successfully', user.toJSON());
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

/**
 * API 2: GET /api/users/:id
 * Get a user's profile by their MongoDB _id.
 *
 * For security, only the authenticated user can view their own profile.
 * We verify this by comparing the Firebase UID of the token
 * with the firebaseUid stored in the user document.
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the user by MongoDB _id
    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Authorization: only the profile owner can view it
    if (user.firebaseUid !== req.user.uid) {
      return sendError(res, 403, 'You are not authorized to view this profile');
    }

    return sendSuccess(res, 200, 'User retrieved successfully', user.toJSON());
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, getUserById };