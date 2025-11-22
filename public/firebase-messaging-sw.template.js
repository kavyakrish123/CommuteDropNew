// Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// This config will be injected at build time by scripts/generate-sw.js
const firebaseConfig = __FIREBASE_CONFIG__;

if (!firebaseConfig.projectId) {
  console.error('[firebase-messaging-sw.js] Firebase config is missing projectId');
} else {
  firebase.initializeApp(firebaseConfig);
  
  const messaging = firebase.messaging();
  
  // Handle background messages
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

