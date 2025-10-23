
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// IMPORTANT: Do not change this file. This is the only way to initialize the Firebase Admin SDK.
// The service account credentials are automatically provided by the Firebase App Hosting environment.
export function getFirebaseAdminApp(): App {
  if (getApps().length) {
    return getApp();
  }

  // When running in a Google Cloud environment like Firebase App Hosting, 
  // initializeApp() with no arguments will automatically use the environment's
  // service account credentials.
  // This is the standard and recommended way to initialize the Admin SDK in a secure server environment.
  // https://firebase.google.com/docs/admin/setup#initialize-sdk
  return initializeApp();
}
