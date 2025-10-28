
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// This is a global cache for the admin app instance.
let adminApp: App | null = null;
let initializationError: Error | null = null;

/**
 * Retrieves the singleton instance of the Firebase Admin App.
 * This function implements a singleton pattern to ensure that the Firebase Admin SDK
 * is initialized only once per server instance, preventing re-initialization errors.
 * It's crucial for stable server-side Firebase operations.
 * @returns The initialized Firebase Admin App instance.
 */
export function getFirebaseAdminApp(): App {
  // If we had a previous initialization error and we're at build time, throw it
  if (initializationError && typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    throw initializationError;
  }

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

  // Check for service account credentials from environment variable
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  try {
    if (serviceAccount) {
      // Use service account credentials if provided
      try {
        const serviceAccountObj = JSON.parse(serviceAccount);
        adminApp = initializeApp({
          credential: cert(serviceAccountObj),
        });
        console.log('Firebase Admin initialized with service account credentials.');
      } catch (parseError) {
        console.error('Failed to parse service account credentials:', parseError);
        throw new Error('Invalid Firebase service account credentials format.');
      }
    } else if (projectId) {
      // Initialize with project ID only (for emulator or limited access)
      // This won't work for all operations but prevents build errors
      adminApp = initializeApp({
        projectId: projectId,
      });
      console.warn(
        'Firebase Admin initialized with project ID only. ' +
        'For full functionality, provide FIREBASE_SERVICE_ACCOUNT_KEY environment variable.'
      );
    } else {
      throw new Error(
        'Firebase Admin SDK initialization failed. Please provide either:\n' +
        '1. FIREBASE_SERVICE_ACCOUNT_KEY environment variable with service account JSON, or\n' +
        '2. NEXT_PUBLIC_FIREBASE_PROJECT_ID for basic initialization\n\n' +
        'To get a service account key:\n' +
        '1. Go to Firebase Console > Project Settings > Service Accounts\n' +
        '2. Click "Generate New Private Key"\n' +
        '3. Add the JSON content to your .env as FIREBASE_SERVICE_ACCOUNT_KEY'
      );
    }
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error(String(error));
    // During build time, we'll allow initialization to fail gracefully
    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL || process.env.NEXT_PHASE === 'phase-production-build') {
      console.error('Firebase Admin initialization failed:', initializationError.message);
      // Create a dummy app to prevent crashes during build
      if (projectId) {
        adminApp = initializeApp({
          projectId: projectId,
        });
      }
    } else {
      throw initializationError;
    }
  }

  if (!adminApp) {
    const error = new Error('Firebase Admin SDK could not be initialized.');
    initializationError = error;
    throw error;
  }

  return adminApp;
}
