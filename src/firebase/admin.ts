
import { initializeApp, getApps, App, cert, credential } from 'firebase-admin/app';

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
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (serviceAccount) {
    try {
      const serviceAccountObj = JSON.parse(serviceAccount);
      adminApp = initializeApp({
        credential: cert(serviceAccountObj),
      });
      console.log('Firebase Admin initialized with service account credentials.');
    } catch (parseError) {
      console.error('Failed to parse service account credentials:', parseError);
      // Fallback to applicationDefault if parsing fails
      adminApp = initializeApp({ credential: credential.applicationDefault() });
      console.warn('Falling back to application default credentials for Firebase Admin.');
    }
  } else if (process.env.GOOGLE_CLOUD_PROJECT) {
      // Use application default credentials if in a Google Cloud environment
      adminApp = initializeApp({ credential: credential.applicationDefault() });
      console.log('Firebase Admin initialized with application default credentials.');
  } else if (projectId) {
    // Initialize with project ID only (for emulator or limited access)
    // This won't work for all operations but prevents build errors
    adminApp = initializeApp({
      projectId: projectId,
    });
    console.warn(
      'Firebase Admin initialized with project ID only. ' +
      'For full functionality, provide FIREBASE_SERVICE_ACCOUNT_KEY or run in a Google Cloud environment.'
    );
  } else {
    throw new Error(
      'Firebase Admin SDK initialization failed. Please provide either:\n' +
      '1. FIREBASE_SERVICE_ACCOUNT_KEY environment variable with service account JSON, or\n' +
      '2. NEXT_PUBLIC_FIREBASE_PROJECT_ID for basic initialization in a non-Google Cloud environment.\n'
    );
  }
  
  return adminApp;
}

/**
 * Checks if Firebase Admin has valid credentials (service account) for privileged operations.
 * @returns true if service account credentials are available, false if only project ID was used
 */
export function hasAdminCredentials(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY || !!process.env.GOOGLE_CLOUD_PROJECT;
}
