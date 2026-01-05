// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Read Firebase config from environment variables (create React app uses REACT_APP_ prefix)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Basic validation/warn if important vars missing
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // This will show up in the browser console during development/build time
  // and won't expose secrets in source control.
  console.warn('[firebase] Missing Firebase config in environment variables.');
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize analytics only in browser and only if measurementId is provided
let analytics;
try {
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
} catch (err) {
  // Analytics may fail in some environments (SSR/build). Don't crash the app.
  // Log a debug message and continue.
  // eslint-disable-next-line no-console
  console.debug('[firebase] Analytics not initialized:', err && err.message ? err.message : err);
}

export const auth = getAuth(app);
export { app, analytics };