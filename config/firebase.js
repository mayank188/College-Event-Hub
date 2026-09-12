const admin = require('firebase-admin');

/**
 * Initializes Firebase Admin SDK using service account credentials
 * stored in environment variables.
 *
 * Firebase Admin SDK is used on the backend ONLY to verify ID tokens.
 * It does NOT handle user login — that happens on the client side.
 */
const initializeFirebase = () => {
  try {
    // The private key from .env contains literal "\n" strings.
    // We must convert them to actual newline characters.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error('Missing Firebase configuration in environment variables');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
};

module.exports = { initializeFirebase, admin };