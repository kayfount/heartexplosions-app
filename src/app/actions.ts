
'use server';

import { generateLifePurposeReport, type LifePurposeReportInput } from '@/ai/flows/generate-life-purpose-report';
import { synthesizePurposeProfile, type SynthesizePurposeProfileInput } from '@/ai/flows/synthesize-purpose-profile';
import { createRealisticRoutePlan, type RoutePlanInput } from '@/ai/flows/create-realistic-route-plan';
import { interactWithAiCoach, type InteractWithAiCoachInput } from '@/ai/flows/interact-with-ai-coach';
import { uploadFile } from '@/firebase/storage';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/firebase/admin';

export async function generateReportAction(input: LifePurposeReportInput) {
  try {
    const result = await generateLifePurposeReport(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate report.' };
  }
}

export async function synthesizeProfileAction(input: SynthesizePurposeProfileInput) {
  try {
    const result = await synthesizePurposeProfile(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to synthesize profile.' };
  }
}

export async function createRoutePlanAction(input: RoutePlanInput) {
  try {
    const result = await createRealisticRoutePlan(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to create route plan.' };
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

interface UpdateProfileActionInput {
    uid: string;
    displayName?: string;
    file?: File;
}

export async function updateProfileAction(input: UpdateProfileActionInput) {
    const { uid, displayName, file } = input;
    let photoURL: string | undefined = undefined;

    // Ensure at least one update operation is requested
    if (!displayName && !file) {
        return { success: true, message: 'No profile information to update.' };
    }

    try {
        if (file) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            photoURL = await uploadFile(uid, file.name, file.type, fileBuffer);
        }

        const auth = getAuth(getFirebaseAdminApp());
        await auth.updateUser(uid, {
            ...(displayName && { displayName }),
            ...(photoURL && { photoURL }),
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Failed to update profile: ${errorMessage}` };
    }
}

    