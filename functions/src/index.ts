/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at:
 *    https://firebase.google.com/docs/functions
 *    https://firebase.google.com/docs/functions/typescript
 */

// Get the interfaces from types.ts
import { DailyQuest, QuestSubmission, User } from "./types";

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const helloWorld = onRequest((request: any, response: { send: (arg0: string) => void; }) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

/**
 * Backend logic for submitting a quest. This doesn't work yet.
 */
// const admin = require('firebase-admin');
// const functions = require('firebase-functions');
// export const submitQuest = onRequest(async (request: { body: { quest: any; }; }, response: { send: (arg0: string) => void; }) => {
//   const { userId, questId, image, location } = request.body;

//   // Validate the user's input
//   if (!userId || !questId || !image) {
//     response.send("Invalid input");
//     return;
//   }

//   const questRef = admin.firestore().collection('quests').doc(questId)
//   const questDoc = await questRef.get();

//   // Check if the quest exists
//   if (!questDoc.exists) {
//     response.send("Quest not found");
//     return;
//   }
  
//   // Add validation for the location in the future

//   // Save the image to Cloud Storage
//   const submissionRef = admin.firestore().collection('submissions').doc();
//   await submissionRef.set({
//     userId,
//     questId,
//     image,
//     location,
//     timestamp: admin.firestore.FieldValue.serverTimestamp()
//   });

//   response.send("Submission successful");
// });