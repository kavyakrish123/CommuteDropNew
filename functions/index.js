const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
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

// Send notification to a user via FCM
exports.sendNotification = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { userId, fcmToken, title, body, data: notificationData } = data;

  if (!fcmToken || !title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: fcmToken, title, body'
    );
  }

  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: notificationData || {},
    token: fcmToken,
    webpush: {
      fcmOptions: {
        link: notificationData?.url || '/app',
      },
      notification: {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      },
    },
    android: {
      priority: 'high',
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send notification: ' + error.message
    );
  }
});

// Trigger notification when request status changes to "picked"
exports.onRequestPicked = functions.firestore
  .document('requests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const requestId = context.params.requestId;

    // Check if status changed to "picked"
    if (before.status !== 'picked' && after.status === 'picked') {
      const senderId = after.senderId;
      const commuterId = after.commuterId;

      // Notify sender
      if (senderId) {
        try {
          const senderDoc = await db.collection('users').doc(senderId).get();
          if (senderDoc.exists) {
            const senderData = senderDoc.data();
            if (senderData.fcmToken && senderData.notificationEnabled) {
              await admin.messaging().send({
                notification: {
                  title: '📦 Pickup Confirmed',
                  body: 'Your item has been picked up by the rider. Track delivery in the app.',
                },
                data: {
                  requestId: requestId,
                  type: 'pickup',
                  role: 'sender',
                  url: `/requests/${requestId}`,
                },
                token: senderData.fcmToken,
                webpush: {
                  fcmOptions: {
                    link: `/requests/${requestId}`,
                  },
                },
              });
            }
          }
        } catch (error) {
          console.error('Error notifying sender:', error);
        }
      }

      // Notify rider
      if (commuterId) {
        try {
          const riderDoc = await db.collection('users').doc(commuterId).get();
          if (riderDoc.exists) {
            const riderData = riderDoc.data();
            if (riderData.fcmToken && riderData.notificationEnabled) {
              await admin.messaging().send({
                notification: {
                  title: '✅ Pickup Verified',
                  body: 'Pickup OTP verified! Start delivery when ready.',
                },
                data: {
                  requestId: requestId,
                  type: 'pickup',
                  role: 'rider',
                  url: `/requests/${requestId}`,
                },
                token: riderData.fcmToken,
                webpush: {
                  fcmOptions: {
                    link: `/requests/${requestId}`,
                  },
                },
              });
            }
          }
        } catch (error) {
          console.error('Error notifying rider:', error);
        }
      }
    }
  });

// Trigger notification when request status changes to "delivered"
exports.onRequestDelivered = functions.firestore
  .document('requests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const requestId = context.params.requestId;

    // Check if status changed to "delivered"
    if (before.status !== 'delivered' && after.status === 'delivered') {
      const senderId = after.senderId;
      const commuterId = after.commuterId;

      // Notify sender
      if (senderId) {
        try {
          const senderDoc = await db.collection('users').doc(senderId).get();
          if (senderDoc.exists) {
            const senderData = senderDoc.data();
            if (senderData.fcmToken && senderData.notificationEnabled) {
              await admin.messaging().send({
                notification: {
                  title: '🎉 Delivery Completed',
                  body: 'Your item has been delivered successfully!',
                },
                data: {
                  requestId: requestId,
                  type: 'drop',
                  role: 'sender',
                  url: `/requests/${requestId}`,
                },
                token: senderData.fcmToken,
                webpush: {
                  fcmOptions: {
                    link: `/requests/${requestId}`,
                  },
                },
              });
            }
          }
        } catch (error) {
          console.error('Error notifying sender:', error);
        }
      }

      // Notify rider
      if (commuterId) {
        try {
          const riderDoc = await db.collection('users').doc(commuterId).get();
          if (riderDoc.exists) {
            const riderData = riderDoc.data();
            if (riderData.fcmToken && riderData.notificationEnabled) {
              await admin.messaging().send({
                notification: {
                  title: '✅ Delivery Completed',
                  body: 'Drop OTP verified! Delivery completed successfully.',
                },
                data: {
                  requestId: requestId,
                  type: 'drop',
                  role: 'rider',
                  url: `/requests/${requestId}`,
                },
                token: riderData.fcmToken,
                webpush: {
                  fcmOptions: {
                    link: `/requests/${requestId}`,
                  },
                },
              });
            }
          }
        } catch (error) {
          console.error('Error notifying rider:', error);
        }
      }
    }
  });

// Scheduled function to check for nearby tasks and notify users
exports.checkNearbyTasks = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('Asia/Singapore')
  .onRun(async (context) => {
    console.log('Checking for nearby tasks...');

    try {
      // Get all users with notifications enabled who are commuters
      const usersSnapshot = await db
        .collection('users')
        .where('notificationEnabled', '==', true)
        .where('role', 'in', ['commuter', 'both'])
        .get();

      if (usersSnapshot.empty) {
        console.log('No users with notifications enabled');
        return null;
      }

      // Get all available requests
      const requestsSnapshot = await db
        .collection('requests')
        .where('status', '==', 'created')
        .get();

      if (requestsSnapshot.empty) {
        console.log('No available requests');
        return null;
      }

      const availableRequests = [];
      requestsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.pickupLat && data.pickupLng) {
          availableRequests.push({
            id: doc.id,
            ...data,
          });
        }
      });

      if (availableRequests.length === 0) {
        console.log('No requests with location data');
        return null;
      }

      // For each user, check if they have location data and find nearby tasks
      const notifications = [];
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (!userData.fcmToken) return;

        // Note: In a real implementation, you'd need to store user's current location
        // For now, we'll notify all users with enabled notifications about new tasks
        // You can enhance this by storing user location in the user document
        
        // Check if there are any nearby tasks (you can add location-based filtering here)
        if (availableRequests.length > 0) {
          notifications.push({
            userId: userDoc.id,
            fcmToken: userData.fcmToken,
            taskCount: availableRequests.length,
          });
        }
      });

      // Send notifications
      for (const notification of notifications) {
        try {
          await admin.messaging().send({
            notification: {
              title: '🚚 New Delivery Tasks Available',
              body: `${notification.taskCount} delivery task${notification.taskCount > 1 ? 's' : ''} available near you!`,
            },
            data: {
              type: 'nearby_tasks',
              count: notification.taskCount.toString(),
              url: '/app?tab=available',
            },
            token: notification.fcmToken,
            webpush: {
              fcmOptions: {
                link: '/app?tab=available',
              },
            },
          });
          console.log(`Notification sent to user ${notification.userId}`);
        } catch (error) {
          console.error(`Error sending notification to user ${notification.userId}:`, error);
        }
      }

      console.log(`Processed ${notifications.length} notifications`);
      return null;
    } catch (error) {
      console.error('Error in checkNearbyTasks:', error);
      return null;
    }
  });

// Trigger notification when a new request is created (notify nearby commuters)
exports.onNewRequestCreated = functions.firestore
  .document('requests/{requestId}')
  .onCreate(async (snap, context) => {
    const request = snap.data();
    const requestId = context.params.requestId;

    // Only notify if request has location data
    if (!request.pickupLat || !request.pickupLng) {
      return null;
    }

    try {
      // Get all commuters with notifications enabled
      const commutersSnapshot = await db
        .collection('users')
        .where('notificationEnabled', '==', true)
        .where('role', 'in', ['commuter', 'both'])
        .get();

      if (commutersSnapshot.empty) {
        return null;
      }

      // For each commuter, check if they're nearby (within 5km)
      // Note: In production, you'd want to store user's current location
      // For now, we'll send a general notification to all commuters
      const notifications = [];
      commutersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.fcmToken) {
          notifications.push({
            userId: doc.id,
            fcmToken: userData.fcmToken,
          });
        }
      });

      // Send notifications (limit to first 10 to avoid spam)
      const limitedNotifications = notifications.slice(0, 10);
      for (const notification of limitedNotifications) {
        try {
          await admin.messaging().send({
            notification: {
              title: '📦 New Delivery Task Available',
              body: `A new delivery task is available near ${request.pickupPincode}. Check it out!`,
            },
            data: {
              type: 'new_task',
              requestId: requestId,
              url: `/requests/${requestId}`,
            },
            token: notification.fcmToken,
            webpush: {
              fcmOptions: {
                link: `/requests/${requestId}`,
              },
            },
          });
        } catch (error) {
          console.error(`Error sending notification to user ${notification.userId}:`, error);
        }
      }

      return null;
    } catch (error) {
      console.error('Error in onNewRequestCreated:', error);
      return null;
    }
  });

