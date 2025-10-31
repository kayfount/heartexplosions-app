'use server';

import { generateLifePurposeReport, type LifePurposeReportInput } from '@/ai/flows/generate-life-purpose-report';
import { synthesizePurposeProfile, type SynthesizePurposeProfileInput } from '@/ai/flows/synthesize-purpose-profile';
import { createRealisticRoutePlan, type RoutePlanInput } from '@/ai/flows/create-realistic-route-plan';
import { interactWithAiCoach, type InteractWithAiCoachInput } from '@/ai/flows/interact-with-ai-coach';
import { generateCareerIdeas, type GenerateCareerIdeasInput } from '@/ai/flows/generate-career-ideas';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';
import type { UserProfile } from '@/models/user-profile';

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

interface SynthesizePurposeProfileActionInput extends SynthesizePurposeProfileInput {
    uid: string;
}

export async function synthesizePurposeProfileAction(input: SynthesizePurposeProfileActionInput) {
  const { uid, ...flowInput } = input;
  if (!uid) {
    return { success: false, error: 'User not authenticated.' };
  }
  try {
    const result = await synthesizePurposeProfile(flowInput);

    const profileUpdate: Partial<UserProfile> = {};
    if (input.focusArea === 'contribution') {
        profileUpdate.contributionProfile = result.purposeProfile;
    } else if (input.focusArea === 'calling') {
        profileUpdate.callingProfile = result.purposeProfile;
    }

    if (Object.keys(profileUpdate).length > 0) {
        await saveUserProfile({ uid, profileData: profileUpdate });
    }

    revalidatePath('/driver/purpose-profile');
    revalidatePath('/insights');

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

interface GenerateCareerIdeasActionInput extends GenerateCareerIdeasInput {
    uid: string;
}

export async function generateCareerIdeasAction(input: GenerateCareerIdeasActionInput) {
    const { uid, ...flowInput } = input;
    if (!uid) {
        return { success: false, error: 'User not authenticated.' };
    }
    try {
        const result = await generateCareerIdeas(flowInput);

        const currentIdeas = input.userProfile.careerIdeas || [];
        const newIdeas = result.ideas;
        const combinedIdeas = [...currentIdeas, ...newIdeas];
        const uniqueIdeas = Array.from(new Set(combinedIdeas));
        
        await saveUserProfile({ uid, profileData: { careerIdeas: uniqueIdeas }});
        
        revalidatePath('/driver/purpose-profile');
        revalidatePath('/insights');

        return { success: true, data: { ideas: uniqueIdeas } };

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to generate ideas. ${errorMessage}` };
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

    const app = getFirebaseAdminApp();
    const db = getFirestore(app);
    const auth = getAuth(app);

    try {
        const userProfileRef = db.collection('users').doc(uid);

        const updates: any = { ...profileData };

        // If displayName is part of the data, update Firebase Auth as well
        if (profileData.displayName) {
            await auth.updateUser(uid, { displayName: profileData.displayName });
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
