// server/firebase/admin.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Support multiple ways to provide the service account:
// 1. FIREBASE_SERVICE_ACCOUNT_PATH (path to JSON file)
// 2. FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON string)
// 3. existing ./serviceAccountKey.json file (legacy)

// Also support FIREBASE_SERVICE_ACCOUNT_B64 which should contain a base64-encoded
// JSON string. This is handy for CI/CD or hosting platforms where embedding
// raw JSON in env vars is awkward.

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
  try {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
    console.info('[firebase-admin] Loaded service account from FIREBASE_SERVICE_ACCOUNT_B64');
  } catch (err) {
    console.error('[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_B64:', err.message);
    throw err;
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const resolved = path.isAbsolute(p) ? p : path.join(__dirname, '..', p);
  try {
    serviceAccount = require(resolved);
    console.info('[firebase-admin] Loaded service account from', resolved);
  } catch (err) {
    console.error('[firebase-admin] Failed to load service account from path:', resolved, err.message);
    throw err;
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.info('[firebase-admin] Loaded service account from FIREBASE_SERVICE_ACCOUNT_JSON env var');
  } catch (err) {
    console.error('[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err.message);
    throw err;
  }
} else {
  // Fallback to legacy local file
  const localPath = path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(localPath)) {
    serviceAccount = require(localPath);
    console.info('[firebase-admin] Loaded service account from', localPath);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // If GOOGLE_APPLICATION_CREDENTIALS is set, the SDK can pick it up via applicationDefault
    try {
      admin.initializeApp({});
      console.info('[firebase-admin] Initialized using application default credentials (GOOGLE_APPLICATION_CREDENTIALS)');
      module.exports = admin;
      return;
    } catch (err) {
      console.error('[firebase-admin] Failed to initialize with application default credentials:', err.message);
      throw err;
    }
  } else {
    // No credentials found; don't throw here to allow the server to start.
    // We'll export a stub that will raise clear errors when used.
    const msg = 'No Firebase service account provided. Set FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_B64, GOOGLE_APPLICATION_CREDENTIALS, or add serviceAccountKey.json to server/firebase.';
    console.warn('[firebase-admin] ' + msg);
    serviceAccount = null;
  }
}

// If we have a service account, initialize the SDK and export the admin instance.
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  module.exports = admin;
} else {
  // Export a lightweight stub with an `auth()` method that throws when used.
  // This prevents the app from crashing at require-time while giving clear
  // runtime errors when Firebase functionality is invoked.
  const initError = new Error('Firebase admin not initialized. Provide service account via FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_B64, GOOGLE_APPLICATION_CREDENTIALS, or place serviceAccountKey.json in server/firebase.');

  const stubAuth = {
    createUser: async () => { throw initError; },
    getUser: async () => { throw initError; },
    getUserByEmail: async () => { throw initError; },
    verifyIdToken: async () => { throw initError; },
    deleteUser: async () => { throw initError; },
    updateUser: async () => { throw initError; },
    setCustomUserClaims: async () => { throw initError; },
    // Add other commonly used methods as needed; they will all throw the same error.
  };

  const stub = {
    isInitialized: false,
    auth: () => stubAuth,
  };

  module.exports = stub;
}
