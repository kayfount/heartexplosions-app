
'use server';

import { generateLifePurposeReport, type LifePurposeReportInput } from '@/ai/flows/generate-life-purpose-report';
import { synthesizePurposeProfile, type SynthesizePurposeProfileInput } from '@/ai/flows/synthesize-purpose-profile';
import { createRealisticRoutePlan, type RoutePlanInput } from '@/ai/flows/create-realistic-route-plan';
import { interactWithAiCoach, type InteractWithAiCoachInput } from '@/ai/flows/interact-with-ai-coach';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/firebase/admin';
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
    await userProfileRef.set({ lifePurposeReportId: reportRef.id, driverCompleted: true }, { merge: true });

    revalidatePath('/insights');
    revalidatePath('/driver/report');
    revalidatePath('/basecamp');

    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to generate report. ${errorMessage}` };
  }
}

export async function synthesizeProfileAction(input: SynthesizePurposeProfileInput) {
  try {
    const result = await synthesizePurposeProfile(input);
    
    // In a real app, you would save this synthesized profile and mark the destination stage as complete.
    // For now, we just return the result.
    // Example of what saving might look like:
    // const db = getFirestore(getFirebaseAdminApp());
    // const userProfileRef = db.collection('users').doc(uid);
    // await userProfileRef.set({ destinationCompleted: true, purposeProfile: result }, { merge: true });
    // revalidatePath('/basecamp');
    // revalidatePath('/insights');

    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to synthesize profile.' };
  }
}

export async function createRoutePlanAction(input: RoutePlanInput) {
  try {
    const result = await createRealisticRoutePlan(input);
    
    // Similarly, you'd save this and mark the route stage complete.
    // Example:
    // const db = getFirestore(getFirebaseAdminApp());
    // const userProfileRef = db.collection('users').doc(uid);
    // await userProfileRef.set({ routeCompleted: true, routePlan: result }, { merge: true });
    // revalidatePath('/basecamp');
    // revalidatePath('/insights');

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

interface SaveUserProfileInput {
    uid: string;
    profileData: any;
}

export async function saveUserProfile({ uid, profileData }: SaveUserProfileInput) {
    if (!uid) {
        throw new Error('User ID is missing.');
    }
    
    try {
        const adminApp = getFirebaseAdminApp();
        const db = getFirestore(adminApp);
        const auth = getAuth(adminApp);

        const userProfileRef = db.collection('users').doc(uid);
        
        const updates: any = { ...profileData };

        if (profileData.displayName) {
            await auth.updateUser(uid, { displayName: profileData.displayName });
        }
        
        await userProfileRef.set(updates, { merge: true });
        
        // Revalidate all paths that might show user data
        revalidatePath('/basecamp', 'page');
        revalidatePath('/driver', 'layout');
        revalidatePath('/destination', 'page');
        revalidatePath('/route', 'page');
        revalidatePath('/insights', 'page');
        
        return { success: true };
    } catch (error) {
        console.error('Error saving user profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        throw new Error(`Failed to save user profile: ${errorMessage}`);
    }
}
