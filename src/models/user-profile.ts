
export interface UserProfile {
    // Basecamp
    firstName?: string;
    lastName?: string;
    callSign?: string;
    journeyStatus?: string;
    whyNow?: string;
    roleClarityScore?: number;
    quizAnswers?: number[];
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
    driverCompleted?: boolean;
    
    // The Destination
    focusArea?: 'career' | 'contribution' | 'calling';
    purposeProfile?: string;
    alignedPath?: string;
    edgeOfChoosingPrompts?: string;
    quickWins?: string;
    destinationCompleted?: boolean;
    
    // The Route
    availableHours?: number;
    commitments?: string;
    timeline?: string;
    routePlan?: string;
    routeCompleted?: boolean;
}
