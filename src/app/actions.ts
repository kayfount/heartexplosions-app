
'use server';

import { generateLifePurposeReport, type LifePurposeReportInput } from '@/ai/flows/generate-life-purpose-report';
import { synthesizePurposeProfile, type SynthesizePurposeProfileInput } from '@/ai/flows/synthesize-purpose-profile';
import { createRealisticRoutePlan, type RoutePlanInput } from '@/ai/flows/create-realistic-route-plan';
import { interactWithAiCoach, type InteractWithAiCoachInput } from '@/ai/flows/interact-with-ai-coach';
import {
  saveReportClient,
  savePurposeProfileClient,
  saveRoutePlanClient,
  toggleRoutePlanTaskClient
} from '@/firebase/firestore-client';
import { revalidatePath } from 'next/cache';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';

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

    // This action still uses a client-side helper, which is fine if it works for report generation logic.
    // We are only fixing saveUserProfile for now.
    await saveReportClient(uid, reportInput, result.report);

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
    await savePurposeProfileClient(uid, profileInput, result);
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
    const routePlanId = await saveRoutePlanClient(uid, planInput, result);

    revalidatePath('/route');
    revalidatePath('/insights');

    return { success: true, data: result, routePlanId };
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
        const completed = await toggleRoutePlanTaskClient(uid, taskIndex);
        revalidatePath('/route');
        return { success: true, completed };
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
        const adminApp = getFirebaseAdminApp();
        const db = getFirestore(adminApp);
        const userRef = db.collection('users').doc(uid);
        
        await userRef.set(profileData, { merge: true });

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
