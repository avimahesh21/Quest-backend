import {onRequest} from "firebase-functions/v2/https";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

export const getQuest = onRequest((request, response) => {
  const db = getFirestore();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of the day

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); // Next day

  const todayStart = Timestamp.fromDate(today);
  const todayEnd = Timestamp.fromDate(tomorrow);

  db.collection("Quests")
    .where("timestamp", ">=", todayStart)
    .where("timestamp", "<", todayEnd)
    .get()
    .then((snapshot) => {
      const quests: any[] = [];

      if (snapshot.empty) {
        response.status(404).send({message: "No quests found for today."});
        return;
      }

      snapshot.forEach((doc) => {
        const quest = {
          id: doc.id,
          description: doc.data().Desc,
          timestamp: doc.data().timestamp.toDate(), // Assuming 'timestamp' is stored in Firestore
        };
        quests.push(quest);
      });

      response.status(200).json(quests); // Send quests as JSON
    })
    .catch((error) => {
      console.error("Error fetching quests: ", error);
      response.status(500).send({error: error.message});
    });
});


export const getAllPosts = onRequest((request, response) => {
  const db = getFirestore();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

  const todayStart = Timestamp.fromDate(today);
  const todayEnd = Timestamp.fromDate(tomorrow);


  db.collection("Posts")
    .where("Date", ">=", todayStart)
    .where("Date", "<", todayEnd)
    .get()
    .then((snapshot) => {
      const posts: any[] = [];

      if (snapshot.empty) {
        response.status(404).send({message: "No quests found for today."});
        return;
      }

      snapshot.forEach((doc) => {
        const post = {
          DatePosted: doc.data().Date,
          ImageData: doc.data().ImageData,
          LocationData: doc.data().LocationData,
          Note: doc.data().Note,
          PostID: doc.data().PostID,
          Upvotes: doc.data().Upvotes,
          UserID: doc.data().UserID,
        };
        posts.push(post);
      });

      response.status(200).json(posts); // Send quests as JSON
    })
    .catch((error) => {
      console.error("Error fetching posts: ", error);
      response.status(500).send({error: error.message});
    });
});


export const getTopUsersByVotes = onRequest((request, response) => {
  const db = getFirestore();
  db.collection("Users")
    .orderBy("Upvotes", "desc") // Order by 'upvotes' in descending order
    .get()
    .then((snapshot) => {
      const users: any[] = [];

      snapshot.forEach((doc) => {
        const user = {
          UserID: doc.data().UserID,
          Upvotes: doc.data().Upvotes,
          Streak: doc.data().Streak,
        };
        users.push(user);
      });

      response.status(200).json(users); // Send sorted users as JSON
    })
    .catch((error) => {
      console.error("Error fetching users: ", error);
      response.status(500).send({error: error.message});
    });
});


export const getTopUsersByStreaks = onRequest((request, response) => {
  const db = getFirestore();
  db.collection("Users")
    .orderBy("Streak", "desc") // Order by 'upvotes' in descending order
    .get()
    .then((snapshot) => {
      const users: any[] = [];

      snapshot.forEach((doc) => {
        const user = {
          UserID: doc.data().UserID,
          Upvotes: doc.data().Upvotes,
          Streak: doc.data().Streak,
        };
        users.push(user);
      });

      response.status(200).json(users); // Send sorted users as JSON
    })
    .catch((error) => {
      console.error("Error fetching users: ", error);
      response.status(500).send({error: error.message});
    });
});

export const getUserData = onRequest((request, response) => {
  const userId = request.query.userId as string; // Access the userId query parameter
  if (!userId) {
    response.status(400).send("No user ID provided");
  }

  const db = getFirestore();
  db.collection("Users").doc(userId)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        response.status(404).send({message: "User not found"});
      }

      response.status(200).json(doc.data());
    })
    .catch((error) => {
      response.status(500).send({error: error.message});
    });
});

// export const getQuestCompleted = onRequest((request, response) => {
//     const userId = request.query.userId as string;
//     //check if most prev post was posted

// });

export const getPrevPostsFromUser = onRequest(async (request, response) => {
  const userId = request.query.userId as string;
  if (!userId) {
    response.status(400).send("No user ID provided");
    return;
  }

  const db = getFirestore();
  try {
    const userDocSnapshot = await db.collection("Users").doc(userId).get();
    if (!userDocSnapshot.exists) {
      response.status(404).send({message: "User not found"});
      return;
    }

    const userPostsIds = userDocSnapshot.data()?.Posts;
    if (!userPostsIds || !Array.isArray(userPostsIds)) {
      response.status(404).send({message: "No posts found for this user"});
      return;
    }

    const postsPromises = userPostsIds.map((postId: string) => {
      return db.collection("Posts").doc(postId).get();
    });

    const postsSnapshots = await Promise.all(postsPromises);
    const posts = postsSnapshots.map((postSnapshot) => {
      if (!postSnapshot.exists) {
        // Handle the case where the post doesn't exist, if necessary
        return null;
      }
      return {postId: postSnapshot.id, ...postSnapshot.data()};
    }).filter((post) => post !== null); // Remove nulls from the array of posts

    response.status(200).json(posts);
  } catch (error: any) {
    console.error("Error fetching user's posts: ", error);
    response.status(500).send({error: error.message});
  }
});

/**
 * Checks whether a user has completed a quest for today.
 */
export const getQuestCompleted = onRequest(async (request, response) => {
  const db = getFirestore();
  const userId = request.query.userId as string;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today

  const tommorow = new Date(today);
  tommorow.setDate(tommorow.getDate() + 1);

  const todayStart = Timestamp.fromDate(today);
  const todayEnd = Timestamp.fromDate(tommorow);

  db.collection("Posts")
    .where("Date", ">=", todayStart)
    .where("Date", "<", todayEnd)
    .where("UserID", "==", userId)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        response.status(200).send({
          completed: false,
          message: "User has not completed a quest today.",
        });
        return;
      }
      response.status(200).send({
        completed: true,
        message: "User has completed a quest today.",
      });
    }).catch((error) => {
      console.error("Error getting quest completion status: ", error);
      response.status(500).send({error: error.message});
    });
});
/**
 * Backend logic for submitting a quest. This doesn't work yet.
 */
// const admin = require('firebase-admin');
// const functions = require('firebase-functions');
// export const submitQuest = onRequest(async (request: { body: { quest: any; };
// }, response: { send: (arg0: string) => void; }) => {
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
//   }//   // Add validation for the location in the future

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
