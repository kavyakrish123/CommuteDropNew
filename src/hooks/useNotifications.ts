"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  initializeNotifications,
  setupForegroundMessageListener,
} from "@/lib/notifications/fcm";

export function useNotifications() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check current permission status
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Initialize notifications when user is logged in
    if (user && !isInitialized) {
      initializeNotifications(user.uid)
        .then((success) => {
          setIsInitialized(success);
          if ("Notification" in window) {
            setPermission(Notification.permission);
          }
        })
        .catch((error) => {
          console.error("Error initializing notifications:", error);
        });
    }

    // Set up foreground message listener
    const unsubscribe = setupForegroundMessageListener((payload) => {
      console.log("Foreground message:", payload);
      // Handle foreground messages (already shown as notification in fcm.ts)
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isInitialized]);

  return {
    isInitialized,
    permission,
    isEnabled: permission === "granted",
  };
}

