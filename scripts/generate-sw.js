// Script to generate service worker with Firebase config injected
const fs = require('fs');
const path = require('path');

// Read environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Read the service worker template
const swTemplate = fs.readFileSync(
  path.join(__dirname, '../public/firebase-messaging-sw.template.js'),
  'utf8'
);

// Replace the config placeholder with actual config
const swContent = swTemplate.replace(
  '__FIREBASE_CONFIG__',
  JSON.stringify(firebaseConfig)
);

// Write the generated service worker
fs.writeFileSync(
  path.join(__dirname, '../public/firebase-messaging-sw.js'),
  swContent
);

console.log('✅ Service worker generated with Firebase config');

