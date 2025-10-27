import { initializeApp, getApps, App, applicationDefault, credential } from 'firebase-admin/app';

// This is a global cache for the admin app instance.
let adminApp: App | null = null;

/**
 * Retrieves the singleton instance of the Firebase Admin App.
 * This function implements a singleton pattern to ensure that the Firebase Admin SDK
 * is initialized only once per server instance, preventing re-initialization errors.
 * It's crucial for stable server-side Firebase operations.
 * @returns The initialized Firebase Admin App instance.
 */
export function getFirebaseAdminApp(): App {
  // If the instance is already cached, return it immediately.
  if (adminApp) {
    return adminApp;
  }

  // If running in an environment where apps might already be initialized,
  // use the first available app. This handles some edge cases.
  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp;
  }

  // If no app is initialized, create a new one using Application Default Credentials.
  // This is the standard way to authenticate in Google Cloud environments like App Hosting.
  adminApp = initializeApp({
    credential: applicationDefault(),
  });

  if (!adminApp) {
    throw new Error('Firebase Admin SDK could not be initialized.');
  }

  return adminApp;
}
