export interface UserProfile {
    // Basecamp
    firstName?: string;
    lastName?: string;
    callSign?: string;
    journeyStatus?: string;
    whyNow?: string;
    roleClarityScore?: number;
    guideDownloaded?: boolean;
    playlistAdded?: boolean;
    
    // The Driver
    enneagramType?: string;
    wing?: string;
    subtype?: string;
    instinctualStacking?: string;
    trifix?: string;
    coreValues?: string[];
    lifePurposeReportId?: string; // This would be a reference to a 'reports' collection
    skills?: string[];
    passions?: string[];
    interests?: string[];
    industrySectors?: string;
    energizingWork?: string;
    age?: number;
    desiredRetirementAge?: number;
    location?: string;
    preferredWorkLifeBalance?: string;
    longTermAspirations?: string;
    learningAndDevelopment?: string;
    dreamLife?: string;
    careerIdeas?: string[];
    dreamProjects?: string;
    lifetimeImpact?: string;
    driverCompleted?: boolean;
    timeLimits?: string;
    financialRunway?: string;
    workLifeIntegration?: string;
    fearsAndBlocks?: string;
    challengesAndConcerns?: string;
    toolsAndSupports?: string;
    willingnessToTry?: string;
    comfortWithUncertainty?: string;
    appetiteForRisk?: string;
    supportSystem?: string;
    
    // The Destination
    focusArea?: 'career' | 'contribution' | 'calling';
    purposeProfile?: string; // Storing the synthesized profile text directly
    destinationCompleted?: boolean;
    
    // The Route
    availableHours?: number;
    commitments?: string;
    timeline?: string;
    routePlan?: string; // Storing the generated route plan text directly
    routeCompleted?: boolean;
}

    