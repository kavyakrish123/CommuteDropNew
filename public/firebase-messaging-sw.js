// Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Firebase config - will be set via message from main app
let firebaseApp = null;
let messaging = null;

// Setup background message handler
function setupBackgroundMessageHandler() {
  if (messaging) {
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification?.title || 'CommuteDrop';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: payload.data?.requestId || 'commutedrop',
        data: payload.data || {},
        requireInteraction: payload.data?.requireInteraction === 'true',
        actions: payload.data?.actions ? JSON.parse(payload.data.actions) : [],
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
}

// Listen for config from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    const config = event.data.config;
    if (config && config.projectId) {
      try {
        // Only initialize if not already initialized
        if (!firebaseApp) {
          firebaseApp = firebase.initializeApp(config);
          messaging = firebase.messaging();
          setupBackgroundMessageHandler();
          console.log('[firebase-messaging-sw.js] Firebase initialized with config from main app');
        }
      } catch (error) {
        console.error('[firebase-messaging-sw.js] Error initializing Firebase:', error);
      }
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  const data = event.notification.data;
  const urlToOpen = data?.url || '/app';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

