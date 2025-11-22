"use client";

import { DeliveryRequest, RequestStatus } from "@/lib/types";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Send notification via Firebase Cloud Functions or directly via FCM
// Note: In production, you should use Cloud Functions to send notifications
// This is a client-side helper that would trigger a Cloud Function
export async function sendNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    // Get user's FCM token
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.warn("User not found for notification");
      return;
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;
    const notificationEnabled = userData?.notificationEnabled;

    if (!fcmToken || !notificationEnabled) {
      console.log("User has notifications disabled or no FCM token");
      return;
    }

    // In production, call a Cloud Function here
    // For now, we'll log it - you'll need to set up a Cloud Function
    console.log("Would send notification:", {
      userId,
      fcmToken,
      title,
      body,
      data,
    });

    // TODO: Call Cloud Function to send notification
    // Example:
    // await fetch('/api/send-notification', {
    //   method: 'POST',
    //   body: JSON.stringify({ userId, fcmToken, title, body, data })
    // });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// Notify user about pickup event
export async function notifyPickupEvent(
  request: DeliveryRequest,
  userId: string
): Promise<void> {
  const isSender = request.senderId === userId;
  const isRider = request.commuterId === userId;

  if (isSender) {
    await sendNotificationToUser(userId, "📦 Pickup Confirmed", 
      `Your item has been picked up by the rider. Track delivery in the app.`,
      { requestId: request.id || "", type: "pickup", role: "sender" }
    );
  } else if (isRider) {
    await sendNotificationToUser(userId, "✅ Pickup Verified", 
      `Pickup OTP verified! Start delivery when ready.`,
      { requestId: request.id || "", type: "pickup", role: "rider" }
    );
  }
}

// Notify user about drop event
export async function notifyDropEvent(
  request: DeliveryRequest,
  userId: string
): Promise<void> {
  const isSender = request.senderId === userId;
  const isRider = request.commuterId === userId;

  if (isSender) {
    await sendNotificationToUser(userId, "🎉 Delivery Completed", 
      `Your item has been delivered successfully!`,
      { requestId: request.id || "", type: "drop", role: "sender" }
    );
  } else if (isRider) {
    await sendNotificationToUser(userId, "✅ Delivery Completed", 
      `Drop OTP verified! Delivery completed successfully.`,
      { requestId: request.id || "", type: "drop", role: "rider" }
    );
  }
}

// Notify riders about nearby available tasks
export async function notifyNearbyTasks(
  userLat: number,
  userLng: number,
  radiusKm: number = 5
): Promise<void> {
  try {
    // Get all users with notifications enabled
    const usersQuery = query(
      collection(db, "users"),
      where("notificationEnabled", "==", true),
      where("role", "in", ["commuter", "both"])
    );

    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get available requests
    const requestsQuery = query(
      collection(db, "requests"),
      where("status", "==", "created")
    );

    const requestsSnapshot = await getDocs(requestsQuery);
    const availableRequests = requestsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as DeliveryRequest))
      .filter((req) => {
        if (!req.pickupLat || !req.pickupLng) return false;
        const distance = calculateDistance(
          userLat,
          userLng,
          req.pickupLat,
          req.pickupLng
        );
        return distance <= radiusKm;
      });

    if (availableRequests.length === 0) return;

    // Notify each user about nearby tasks
    for (const user of users) {
      if (!user.fcmToken) continue;

      // Check if user is near any available task
      const nearbyTasks = availableRequests.filter((req) => {
        if (!req.pickupLat || !req.pickupLng) return false;
        const distance = calculateDistance(
          userLat,
          userLng,
          req.pickupLat,
          req.pickupLng
        );
        return distance <= radiusKm;
      });

      if (nearbyTasks.length > 0) {
        await sendNotificationToUser(
          user.id,
          "🚚 New Delivery Tasks Nearby",
          `${nearbyTasks.length} delivery task${nearbyTasks.length > 1 ? "s" : ""} available near you!`,
          {
            type: "nearby_tasks",
            count: nearbyTasks.length.toString(),
            url: "/app?tab=available",
          }
        );
      }
    }
  } catch (error) {
    console.error("Error notifying nearby tasks:", error);
  }
}

