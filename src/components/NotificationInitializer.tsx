"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationInitializer() {
  const { user } = useAuth();
  const { isInitialized } = useNotifications();

  useEffect(() => {
    // Register service worker for push notifications
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker - Firebase Messaging will use this if registered first
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
          
          // Wait for service worker to be ready, then send config
          return registration.update().then(() => {
            // Get the active service worker
            const sw = registration.installing || registration.waiting || registration.active;
            if (sw) {
              const firebaseConfig = {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
              };
              
              if (firebaseConfig.projectId) {
                sw.postMessage({
                  type: 'FIREBASE_CONFIG',
                  config: firebaseConfig,
                });
                console.log("Firebase config sent to service worker");
              } else {
                console.warn("Firebase config missing projectId");
              }
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
          // Don't throw - allow app to continue without push notifications
        });
    }
  }, []);

  return null;
}

