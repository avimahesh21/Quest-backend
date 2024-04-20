/**
 * types.ts
 *
 * Standardized interfaces for each of the collections. Should be used in quest
 * and quest-backend to ensure that the data is consistent across the two.
 */

import {Timestamp, GeoPoint} from "firebase-admin/firestore";

export interface DailyQuest {
    questId: string;
    startTime: Timestamp;
    description: string;
    location: boolean; // If location quest, true; else, false
}

export interface QuestSubmission {
    userId: string;
    submissionId: string;
    submissionTime: Timestamp;
    imageUrl: string;
    location?: GeoPoint; // If location quest, include location; else, null
    note: string;
    votes: number;
}

export interface User {
    userId: string;
    streak: number;
    votes: number;
    submissions: string[]; // Submission IDs referencing QuestSubmissions
}
