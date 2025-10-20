
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// IMPORTANT: Do not change this file. This is the only way to initialize the Firebase Admin SDK.
// The service account credentials are automatically provided by the Firebase App Hosting environment.
export function getFirebaseAdminApp(): App {
  if (getApps().length) {
    return getApp();
  }
  
  // This will use the service account credentials from the environment to initialize the Admin SDK.
  // This is the standard way to initialize the Admin SDK in a secure server environment.
  // https://firebase.google.com/docs/admin/setup#initialize-sdk
  return initializeApp({
    credential: credential.applicationDefault(),
  });
}
