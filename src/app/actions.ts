
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
    
    if (!uid) {
        return { success: false, error: 'User ID is missing.' };
    }
    
    if (!displayName && !file) {
        return { success: true, message: 'No profile information to update.' };
    }

    try {
        const auth = getAuth(getFirebaseAdminApp());
        const user = await auth.getUser(uid);

        let photoURL: string | undefined = user.photoURL;

        if (file) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            photoURL = await uploadFile(uid, file.name, file.type, fileBuffer);
        }
        
        const updates: { displayName?: string; photoURL?: string } = {};

        if (displayName && displayName !== user.displayName) {
            updates.displayName = displayName;
        }

        if (photoURL && photoURL !== user.photoURL) {
            updates.photoURL = photoURL;
        }

        if (Object.keys(updates).length > 0) {
            await auth.updateUser(uid, updates);
        }

        return { success: true, photoURL: updates.photoURL || user.photoURL };
    } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Failed to update profile: ${errorMessage}` };
    }
}
