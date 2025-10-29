
import { initializeApp, getApps, App, credential } from 'firebase-admin/app';

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

  // Check for service account credentials from environment variables.
  // In a managed environment like Firebase App Hosting or Cloud Run,
  // applicationDefault() will automatically find the service account.
  try {
    adminApp = initializeApp({
        credential: credential.applicationDefault(),
    });
    console.log('Firebase Admin initialized with default application credentials.');
  } catch (e) {
    console.error('Failed to initialize Firebase Admin SDK with default credentials.', e);
    // As a fallback for local development, you could try to use a service account key file
    // but in the App Hosting environment, applicationDefault() is the standard.
    // To prevent the app from crashing, we'll create a minimal instance if all else fails.
    if (!adminApp) {
        adminApp = initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'client-only-mode' });
        console.warn('Firebase Admin SDK initialized without full credentials. Admin operations may fail.');
    }
  }
  
  return adminApp;
}

/**
 * Checks if Firebase Admin has valid credentials (service account) for privileged operations.
 * @returns true if service account credentials are available, false if only project ID was used
 */
export function hasAdminCredentials(): boolean {
  // A reliable way to check is to see if the Admin SDK was initialized with credentials.
  // In a Google Cloud environment, this should generally be true.
  return getApps().length > 0 && !!getApps()[0].options.credential;
}
