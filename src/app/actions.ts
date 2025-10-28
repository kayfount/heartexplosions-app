
'use server';

import { generateLifePurposeReport, type LifePurposeReportInput } from '@/ai/flows/generate-life-purpose-report';
import { synthesizePurposeProfile, type SynthesizePurposeProfileInput } from '@/ai/flows/synthesize-purpose-profile';
import { createRealisticRoutePlan, type RoutePlanInput } from '@/ai/flows/create-realistic-route-plan';
import { interactWithAiCoach, type InteractWithAiCoachInput } from '@/ai/flows/interact-with-ai-coach';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp, hasAdminCredentials } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';

interface GenerateReportActionInput extends LifePurposeReportInput {
    uid: string;
}

export async function generateReportAction(input: GenerateReportActionInput) {
  const { uid, ...reportInput } = input;
  if (!uid) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const result = await generateLifePurposeReport(reportInput);
    
    // Save the report to Firestore
    const db = getFirestore(getFirebaseAdminApp());
    const reportRef = db.collection('reports').doc(); // Create a new report with a unique ID
    await reportRef.set({
      ...reportInput,
      report: result.report,
      createdAt: new Date().toISOString(),
    });

    // Update the user's profile with the new report ID
    const userProfileRef = db.collection('users').doc(uid);
    await userProfileRef.set({ lifePurposeReportId: reportRef.id }, { merge: true });

    revalidatePath('/insights');
    revalidatePath('/driver/report');

    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to generate report. ${errorMessage}` };
  }
}

interface SynthesizeProfileActionInput extends SynthesizePurposeProfileInput {
    uid: string;
}

export async function synthesizeProfileAction(input: SynthesizeProfileActionInput) {
  const { uid, ...profileInput } = input;
  if (!uid) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const result = await synthesizePurposeProfile(profileInput);

    // Save the purpose profile to Firestore
    const db = getFirestore(getFirebaseAdminApp());
    const profileRef = db.collection('purposeProfiles').doc();
    await profileRef.set({
      ...profileInput,
      ...result,
      createdAt: new Date().toISOString(),
    });

    // Update the user's profile with the purpose profile ID
    const userProfileRef = db.collection('users').doc(uid);
    await userProfileRef.set({ purposeProfileId: profileRef.id, destinationCompleted: true }, { merge: true });

    revalidatePath('/destination');
    revalidatePath('/insights');

    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to synthesize profile. ${errorMessage}` };
  }
}

interface CreateRoutePlanActionInput extends RoutePlanInput {
    uid: string;
}

export async function createRoutePlanAction(input: CreateRoutePlanActionInput) {
  const { uid, ...planInput } = input;
  if (!uid) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const result = await createRealisticRoutePlan(planInput);

    // Save the route plan to Firestore
    const db = getFirestore(getFirebaseAdminApp());
    const routePlanRef = db.collection('routePlans').doc();
    await routePlanRef.set({
      ...planInput,
      ...result,
      createdAt: new Date().toISOString(),
      completedTasks: [], // Initialize empty array for task completion tracking
    });

    // Update the user's profile with the route plan ID
    const userProfileRef = db.collection('users').doc(uid);
    await userProfileRef.set({ routePlanId: routePlanRef.id, routeCompleted: true }, { merge: true });

    revalidatePath('/route');
    revalidatePath('/insights');

    return { success: true, data: result, routePlanId: routePlanRef.id };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to create route plan. ${errorMessage}` };
  }
}

export async function coachInteractionAction(input: InteractWithAiCoachInput) {
    try {
        const result = await interactWithAiCoach(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to get response from coach.' };
    }
}

interface ToggleRoutePlanTaskInput {
    uid: string;
    taskIndex: number;
}

export async function toggleRoutePlanTask(input: ToggleRoutePlanTaskInput) {
    const { uid, taskIndex } = input;

    if (!uid) {
        throw new Error('User ID is missing.');
    }

    try {
        const db = getFirestore(getFirebaseAdminApp());
        const userProfileRef = db.collection('users').doc(uid);
        const userProfile = await userProfileRef.get();

        if (!userProfile.exists) {
            throw new Error('User profile not found.');
        }

        const routePlanId = userProfile.data()?.routePlanId;
        if (!routePlanId) {
            throw new Error('No route plan found for this user.');
        }

        const routePlanRef = db.collection('routePlans').doc(routePlanId);
        const routePlan = await routePlanRef.get();

        if (!routePlan.exists) {
            throw new Error('Route plan not found.');
        }

        const completedTasks = routePlan.data()?.completedTasks || [];
        const taskIsCompleted = completedTasks.includes(taskIndex);

        // Toggle task completion
        const newCompletedTasks = taskIsCompleted
            ? completedTasks.filter((t: number) => t !== taskIndex)
            : [...completedTasks, taskIndex];

        await routePlanRef.update({ completedTasks: newCompletedTasks });

        revalidatePath('/route');

        return { success: true, completed: !taskIsCompleted };
    } catch (error) {
        console.error('Error toggling route plan task:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        throw new Error(`Failed to toggle task: ${errorMessage}`);
    }
}

interface SaveUserProfileInput {
    uid: string;
    profileData: any;
}

export async function saveUserProfile(input: SaveUserProfileInput) {
    const { uid, profileData } = input;

    if (!uid) {
        throw new Error('User ID is missing.');
    }

    try {
        const db = getFirestore(getFirebaseAdminApp());

        const userProfileRef = db.collection('users').doc(uid);

        const updates: any = { ...profileData };

        // If displayName is part of the data, update Firebase Auth as well (only if we have valid credentials)
        if (profileData.displayName && hasAdminCredentials()) {
            const auth = getAuth(getFirebaseAdminApp());
            await auth.updateUser(uid, { displayName: profileData.displayName });
            // The displayName is already in 'updates', so no need to remove it for Firestore.
        }

        await userProfileRef.set(updates, { merge: true });

        // Revalidate all paths where user profile data might be displayed
        revalidatePath('/basecamp');
        revalidatePath('/driver', 'layout'); // Revalidate the whole layout for sub-pages
        revalidatePath('/destination');
        revalidatePath('/route');
        revalidatePath('/insights');

        return { success: true };
    } catch (error) {
        console.error('Error saving user profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        throw new Error(`Failed to save user profile: ${errorMessage}`);
    }
}
