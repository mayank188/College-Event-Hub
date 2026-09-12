const { admin } = require('../config/firebase');
const { sendError } = require('../utils/response');

/**
 * Authentication Middleware
 *
 * This middleware runs BEFORE any protected route handler.
 * It does the following:
 *
 * 1. Reads the Authorization header from the request.
 * 2. Checks that it follows the format: "Bearer <token>"
 * 3. Extracts the Firebase ID token.
 * 4. Verifies the token using Firebase Admin SDK.
 * 5. Attaches the authenticated user's info to req.user.
 * 6. Calls next() to pass control to the route handler.
 *
 * If anything fails, it returns HTTP 401 and stops the request.
 */
const authenticate = async (req, res, next) => {
  try {
    // Step 1: Get the Authorization header
    const authHeader = req.headers.authorization;

    // Step 2: Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication required');
    }

    // Step 3: Extract the token (everything after "Bearer ")
    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'Authentication required');
    }

    // Step 4: Verify the token using Firebase Admin SDK
    // This contacts Firebase servers to validate the token's signature,
    // check expiration, and return the decoded user information.
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Step 5: Attach user info to the request object
    // Now every subsequent middleware and controller can access req.user
    req.user = {
      uid: decodedToken.uid,           // Firebase unique ID
      email: decodedToken.email,       // User's email from Firebase
      name: decodedToken.name || null, // Display name (may be null)
    };

    // Step 6: Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    // Firebase throws specific error codes for different problems
    if (
      error.code === 'auth/id-token-expired' ||
      error.code === 'auth/id-token-revoked'
    ) {
      return sendError(res, 401, 'Invalid or expired authentication token');
    }

    return sendError(res, 401, 'Invalid or expired authentication token');
  }
};

module.exports = { authenticate };