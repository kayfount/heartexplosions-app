'use server';

import { initializeApp, getApps, App, applicationDefault, credential } from 'firebase-admin/app';

let adminApp: App | null = null;

/**
 * Retrieves the singleton instance of the Firebase Admin App.
 * Initializes the app if it hasn't been already, using application default credentials.
 * @returns The initialized Firebase Admin App instance.
 */
export function getFirebaseAdminApp(): App {
  if (!adminApp) {
    if (getApps().length > 0) {
      adminApp = getApps()[0];
    } else {
      adminApp = initializeApp({
        credential: applicationDefault(),
      });
    }
  }
  
  if (!adminApp) {
      throw new Error('Firebase Admin SDK has not been initialized. Please ensure initializeApp() is called before getFirebaseAdminApp().');
  }

  return adminApp;
}
