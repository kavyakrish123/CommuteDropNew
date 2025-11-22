import { doc, updateDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { User } from "@/lib/types";

/**
 * Submit a rating for a completed delivery
 */
export async function submitRating(
  requestId: string,
  raterId: string,
  ratedUserId: string,
  rating: number,
  comment?: string
): Promise<void> {
  const requestRef = doc(db, "requests", requestId);
  const requestDoc = await getDoc(requestRef);
  
  if (!requestDoc.exists()) {
    throw new Error("Request not found");
  }

  const requestData = requestDoc.data();
  
  // Determine if rater is sender or commuter
  const isSender = requestData.senderId === raterId;
  const isCommuter = requestData.commuterId === raterId;
  
  if (!isSender && !isCommuter) {
    throw new Error("You can only rate users involved in this delivery");
  }

  // Update request with rating
  const updateData: any = {
    updatedAt: serverTimestamp(),
  };

  if (isSender) {
    updateData.senderRating = rating;
    if (comment) {
      updateData.senderRatingComment = comment;
    }
  } else {
    updateData.commuterRating = rating;
    if (comment) {
      updateData.commuterRatingComment = comment;
    }
  }

  await updateDoc(requestRef, updateData);

  // Update user's average rating
  await updateUserRating(ratedUserId);
}

/**
 * Calculate and update a user's average rating
 */
async function updateUserRating(userId: string): Promise<void> {
  // Get all completed requests where this user was rated
  const requestsQuery = query(
    collection(db, "requests"),
    where("status", "==", "completed")
  );

  const requestsSnapshot = await getDocs(requestsQuery);
  const ratings: number[] = [];

  requestsSnapshot.forEach((doc) => {
    const data = doc.data();
    
    // If user is the commuter, get sender ratings
    if (data.commuterId === userId && data.senderRating) {
      ratings.push(data.senderRating);
    }
    
    // If user is the sender, get commuter ratings
    if (data.senderId === userId && data.commuterRating) {
      ratings.push(data.commuterRating);
    }
  });

  // Calculate average
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : null;

  // Update user document
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    rating: averageRating ? Math.round(averageRating * 10) / 10 : null, // Round to 1 decimal
    totalDeliveries: ratings.length,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Check if user has already rated for a request
 */
export async function hasUserRated(
  requestId: string,
  userId: string
): Promise<boolean> {
  const requestRef = doc(db, "requests", requestId);
  const requestDoc = await getDoc(requestRef);
  
  if (!requestDoc.exists()) {
    return false;
  }

  const data = requestDoc.data();
  const isSender = data.senderId === userId;
  
  if (isSender) {
    return !!data.senderRating;
  } else {
    return !!data.commuterRating;
  }
}

