
export interface UserProfile {
    // Basecamp
    firstName?: string;
    lastName?: string;
    callSign?: string;
    journeyStatus?: string;
    whyNow?: string;
    roleClarityScore?: number;
    
    // The Driver
    enneagramType?: string;
    wing?: string;
    subtype?: string;
    instinctualStacking?: string;
    trifix?: string;
    coreValues?: string[];
    lifePurposeReportId?: string; // This would be a reference to a 'reports' collection
    
    // The Destination
    focusArea?: 'career' | 'contribution' | 'calling';
    purposeProfileId?: string; // Ref to a 'reports' collection
    
    // The Route
    availableHours?: number;
    commitments?: string;
    timeline?: string;
    routePlanId?: string; // Ref to a 'reports' collection
}
