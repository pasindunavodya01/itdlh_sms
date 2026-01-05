// server/firebase/admin.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Support multiple ways to provide the service account:
// 1. FIREBASE_SERVICE_ACCOUNT_PATH (path to JSON file)
// 2. FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON string)
// 3. existing ./serviceAccountKey.json file (legacy)

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
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
    const msg = 'No Firebase service account provided. Set FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON, GOOGLE_APPLICATION_CREDENTIALS, or add serviceAccountKey.json to server/firebase.';
    console.error('[firebase-admin] ' + msg);
    throw new Error(msg);
  }
}

// Initialize admin SDK with the loaded service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
