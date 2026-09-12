/**
 * Firebase ID Token Helper Script
 *
 * This script helps you get a Firebase ID Token for Postman testing.
 * It uses Firebase's REST API to sign in with email/password
 * and returns an ID token that you can use in the Authorization header.
 *
 * Usage:
 *   1. Set FIREBASE_API_KEY in your .env file
 *   2. Run: npm run get-token
 *   3. Enter your email and password when prompted
 *   4. Copy the ID token and use it in Postman
 *
 * NOTE: This script is NOT part of the backend API.
 *       It's a testing utility only.
 */

require('dotenv').config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

if (!FIREBASE_API_KEY) {
  console.error('❌ FIREBASE_API_KEY is not set in .env file');
  console.log('Get it from Firebase Console → Project Settings → General → Web API Key');
  process.exit(1);
}

// Read email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('');
  console.log('Usage: node scripts/getFirebaseToken.js <email> <password>');
  console.log('');
  console.log('Example: node scripts/getFirebaseToken.js user@example.com mypassword123');
  console.log('');
  console.log('Make sure you have already created this user in Firebase Console:');
  console.log('Firebase Console → Authentication → Users → Add User');
  console.log('');
  process.exit(1);
}

async function getToken() {
  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ Firebase Authentication Error:', data.error.message);
      process.exit(1);
    }

    console.log('');
    console.log('✅ Firebase Authentication Successful!');
    console.log('');
    console.log('📧 Email:', data.email);
    console.log('🔑 Local ID (Firebase UID):', data.localId);
    console.log('⏰ Token expires in:', data.expiresIn, 'seconds');
    console.log('');
    console.log('='.repeat(80));
    console.log('📋 YOUR FIREBASE ID TOKEN (copy this for Postman):');
    console.log('='.repeat(80));
    console.log('');
    console.log(data.idToken);
    console.log('');
    console.log('='.repeat(80));
    console.log('');
    console.log('In Postman, set:');
    console.log('  Authorization → Type: Bearer Token');
    console.log('  Token: <paste the token above>');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getToken();