
import { initializeApp, getApps, App, applicationDefault, cert } from 'firebase-admin/app';

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

  // Check for service account credentials from environment variables
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccount) {
    try {
      // Parse the service account JSON
      const serviceAccountObj = JSON.parse(serviceAccount);
      adminApp = initializeApp({
        credential: cert(serviceAccountObj),
      });
      console.log('Firebase Admin initialized with service account credentials.');
      return adminApp;
    } catch (parseError) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
      // Fall through to try application default credentials
    }
  }

  // Fallback to Application Default Credentials (for Google Cloud environments)
  // This is the standard way to authenticate in Google Cloud environments like App Hosting.
  try {
    adminApp = initializeApp({
      credential: applicationDefault(),
    });
    console.log('Firebase Admin initialized with application default credentials.');
    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK with ADC:', error);
    throw new Error(
      'Firebase Admin SDK initialization failed. Ensure you have provided FIREBASE_SERVICE_ACCOUNT_KEY ' +
      'as an environment variable or are running in a Google Cloud environment with default credentials.'
    );
  }
}
