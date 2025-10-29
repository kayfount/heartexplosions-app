/**
 * Client-side Firestore operations
 * These functions use the client-side Firebase SDK to perform Firestore operations
 * without requiring Firebase Admin SDK credentials.
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { getFirebaseApp } from './index';

/**
 * Get the client-side Firestore instance
 */
export function getClientFirestore() {
  const app = getFirebaseApp();
  return getFirestore(app);
}

/**
 * Save user profile data to Firestore
 */
export async function saveUserProfileClient(uid: string, profileData: any) {
  const db = getClientFirestore();
  const userRef = doc(db, 'users', uid);

  await setDoc(userRef, profileData, { merge: true });
}

/**
 * Save a report to Firestore and update user profile with report ID
 */
export async function saveReportClient(uid: string, reportInput: any, reportData: any) {
  const db = getClientFirestore();

  // Create a new report document
  const reportsCollection = collection(db, 'reports');
  const reportRef = doc(reportsCollection);

  await setDoc(reportRef, {
    ...reportInput,
    report: reportData,
    createdAt: Timestamp.now().toDate().toISOString(),
  });

  // Update user profile with the report ID
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { lifePurposeReportId: reportRef.id }, { merge: true });

  return reportRef.id;
}

/**
 * Save a purpose profile to Firestore and update user profile
 */
export async function savePurposeProfileClient(uid: string, profileInput: any, profileResult: any) {
  const db = getClientFirestore();

  // Create a new purpose profile document
  const profilesCollection = collection(db, 'purposeProfiles');
  const profileRef = doc(profilesCollection);

  await setDoc(profileRef, {
    ...profileInput,
    ...profileResult,
    createdAt: Timestamp.now().toDate().toISOString(),
  });

  // Update user profile with the purpose profile ID
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    purposeProfileId: profileRef.id,
    destinationCompleted: true
  }, { merge: true });

  return profileRef.id;
}

/**
 * Save a route plan to Firestore and update user profile
 */
export async function saveRoutePlanClient(uid: string, planInput: any, planResult: any) {
  const db = getClientFirestore();

  // Create a new route plan document
  const plansCollection = collection(db, 'routePlans');
  const planRef = doc(plansCollection);

  await setDoc(planRef, {
    ...planInput,
    ...planResult,
    createdAt: Timestamp.now().toDate().toISOString(),
    completedTasks: [], // Initialize empty array for task completion tracking
  });

  // Update user profile with the route plan ID
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    routePlanId: planRef.id,
    routeCompleted: true
  }, { merge: true });

  return planRef.id;
}

/**
 * Toggle a task in a route plan
 */
export async function toggleRoutePlanTaskClient(uid: string, taskIndex: number) {
  const db = getClientFirestore();

  // Get user profile to find route plan ID
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('User profile not found.');
  }

  const routePlanId = userSnap.data()?.routePlanId;
  if (!routePlanId) {
    throw new Error('No route plan found for this user.');
  }

  // Get route plan
  const planRef = doc(db, 'routePlans', routePlanId);
  const planSnap = await getDoc(planRef);

  if (!planSnap.exists()) {
    throw new Error('Route plan not found.');
  }

  const completedTasks = planSnap.data()?.completedTasks || [];
  const taskIsCompleted = completedTasks.includes(taskIndex);

  // Toggle task completion
  const newCompletedTasks = taskIsCompleted
    ? completedTasks.filter((t: number) => t !== taskIndex)
    : [...completedTasks, taskIndex];

  await updateDoc(planRef, { completedTasks: newCompletedTasks });

  return !taskIsCompleted;
}
