"use client";

import { getMessagingInstance } from "@/lib/firebase/client";
import { getToken, onMessage, Messaging } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  
  try {
    const messaging = getMessagingInstance();
    if (!messaging) {
      console.warn("Firebase Messaging not available");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    // Get FCM token - specify service worker registration
    let serviceWorkerRegistration = null;
    if ('serviceWorker' in navigator) {
      try {
        serviceWorkerRegistration = await navigator.serviceWorker.ready;
      } catch (error) {
        console.warn('Service worker not ready:', error);
      }
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: serviceWorkerRegistration || undefined,
    });

    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("No FCM token available");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
}

// Save FCM token to user document
export async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      fcmToken: token,
      notificationEnabled: true,
    });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    throw error;
  }
}

// Listen for foreground messages
export function setupForegroundMessageListener(
  callback: (payload: any) => void
): (() => void) | null {
  if (typeof window === "undefined") return null;
  
  try {
    const messaging = getMessagingInstance();
    if (!messaging) return null;

    return onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload);
      callback(payload);
      
      // Show notification manually in foreground
      if (payload.notification) {
        new Notification(payload.notification.title || "Pikkrr", {
          body: payload.notification.body || "",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: payload.data?.requestId || "pikkrr",
          data: payload.data || {},
        });
      }
    });
  } catch (error) {
    console.error("Error setting up foreground message listener:", error);
    return null;
  }
}

// Initialize notifications for user
export async function initializeNotifications(userId: string): Promise<boolean> {
  try {
    const token = await requestNotificationPermission();
    if (token) {
      await saveFCMToken(userId, token);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error initializing notifications:", error);
    return false;
  }
}

