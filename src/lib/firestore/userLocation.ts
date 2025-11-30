/**
 * User location management
 * Stores user's current location for nearby request notifications
 */

import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { getCurrentLocation } from "@/lib/utils/geolocation";

/**
 * Update user's current location
 * This is used for nearby request notifications
 */
export async function updateUserLocation(userId: string): Promise<void> {
  try {
    const location = await getCurrentLocation();
    if (!location) {
      console.warn("Could not get user location");
      return;
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      currentLat: location.lat,
      currentLng: location.lng,
      lastLocationUpdate: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user location:", error);
    throw error;
  }
}

/**
 * Update user's current location with provided coordinates
 */
export async function updateUserLocationWithCoords(
  userId: string,
  lat: number,
  lng: number
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      currentLat: lat,
      currentLng: lng,
      lastLocationUpdate: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user location:", error);
    throw error;
  }
}

