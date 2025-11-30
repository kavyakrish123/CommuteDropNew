const {onCall} = require('firebase-functions/v2/https');
const {onDocumentUpdated, onDocumentCreated} = require('firebase-functions/v2/firestore');
const {onSchedule} = require('firebase-functions/v2/scheduler');
const {setGlobalOptions} = require('firebase-functions/v2');
const {HttpsError} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Set global options for all functions
setGlobalOptions({
  region: 'asia-southeast1', // Singapore region
  maxInstances: 10,
});

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
exports.sendNotification = onCall(async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const data = request.data;

  const {userId, fcmToken, title, body, data: notificationData} = data;

  if (!fcmToken || !title || !body) {
    throw new HttpsError(
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
    return {success: true, messageId: response};
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new HttpsError(
      'internal',
      'Failed to send notification: ' + error.message
    );
  }
});

// Helper function to send notification
async function sendNotificationToUser(userId, title, body, data) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    if (!userData.fcmToken || !userData.notificationEnabled) return;
    
    await admin.messaging().send({
      notification: { title, body },
      data: {
        ...data,
        requestId: data.requestId || '',
        url: data.url || '/app',
      },
      token: userData.fcmToken,
      webpush: {
        fcmOptions: {
          link: data.url || '/app',
        },
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
        },
      },
      android: { priority: 'high' },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    });
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
  }
}

// Trigger notification on ALL request status changes
exports.onRequestStatusChange = onDocumentUpdated(
  'requests/{requestId}',
  async (event) => {
    const change = event.data;
    if (!change) return null;
    
    const before = change.before.data();
    const after = change.after.data();
    const requestId = event.params.requestId;

    // Skip if status hasn't changed
    if (before.status === after.status) return null;

    const senderId = after.senderId;
    const commuterId = after.commuterId;
    const tipAmount = after.priceOffered || 0;

    // Handle different status changes
    switch (after.status) {
      case 'approved':
        // Notify sender
        if (senderId) {
          await sendNotificationToUser(
            senderId,
            'Helper Approved! 🎉',
            'Your helper has been approved and is ready to pick up.',
            { requestId, type: 'status_change', role: 'sender', url: `/requests/${requestId}` }
          );
        }
        // Notify helper
        if (commuterId) {
          await sendNotificationToUser(
            commuterId,
            "You're Approved! ✅",
            'The sender approved your request. You can now proceed to pickup.',
            { requestId, type: 'status_change', role: 'helper', url: `/requests/${requestId}` }
          );
        }
        break;

      case 'waiting_pickup':
        if (senderId) {
          await sendNotificationToUser(
            senderId,
            'Helper Arriving Soon 📍',
            'Your helper is on the way to the pickup location.',
            { requestId, type: 'status_change', role: 'sender', url: `/requests/${requestId}` }
          );
        }
        if (commuterId) {
          await sendNotificationToUser(
            commuterId,
            'Almost There! 🚶',
            "You're near the pickup location. Get ready to verify OTP.",
            { requestId, type: 'status_change', role: 'helper', url: `/requests/${requestId}` }
          );
        }
        break;

      case 'pickup_otp_pending':
        if (senderId) {
          await sendNotificationToUser(
            senderId,
            'OTP Verification Started 🔐',
            'Your helper is verifying the pickup OTP. Provide the code when asked.',
            { requestId, type: 'status_change', role: 'sender', url: `/requests/${requestId}` }
          );
        }
        if (commuterId) {
          await sendNotificationToUser(
            commuterId,
            'Enter Pickup OTP 🔑',
            'Enter the OTP provided by the sender to complete pickup.',
            { requestId, type: 'status_change', role: 'helper', url: `/requests/${requestId}` }
          );
        }
        break;

      case 'picked':
        if (senderId) {
          await sendNotificationToUser(
            senderId,
            'Item Picked Up! 📦',
            'Your helper has picked up the item and is starting delivery.',
            { requestId, type: 'status_change', role: 'sender', url: `/requests/${requestId}` }
          );
        }
        if (commuterId) {
          await sendNotificationToUser(
            commuterId,
            'Pickup Complete! ✅',
            'Item picked up successfully. Start your delivery now.',
            { requestId, type: 'status_change', role: 'helper', url: `/requests/${requestId}` }
          );
        }
        break;

      case 'in_transit':
        if (senderId) {
          await sendNotificationToUser(
            senderId,
            'Delivery In Progress 🚚',
            'Your helper is on the way to the drop-off location.',
            { requestId, type: 'status_change', role: 'sender', url: `/requests/${requestId}` }
          );
        }
        if (commuterId) {
          await sendNotificationToUser(
            commuterId,
            'On Your Way 🚶',
            "You're delivering the item. Head to the drop-off location.",
            { requestId, type: 'status_change', role: 'helper', url: `/requests/${requestId}` }
          );
        }
        break;

      case 'delivered':
        if (senderId) {
          await sendNotificationToUser(
            senderId,
            'Item Delivered! 🎉',
            'Your helper has arrived at the drop-off location.',
            { requestId, type: 'status_change', role: 'sender', url: `/requests/${requestId}` }
          );
        }
        if (commuterId) {
          await sendNotificationToUser(
            commuterId,
            'Arrived at Drop-off 📍',
            "You've arrived. Verify the drop-off OTP to complete delivery.",
            { requestId, type: 'status_change', role: 'helper', url: `/requests/${requestId}` }
          );
        }
        break;

      case 'completed':
        const tipText = tipAmount > 0 ? ` Tip: $${tipAmount}` : '';
        if (senderId) {
          await sendNotificationToUser(
            senderId,
            'Delivery Completed! ✅',
            `Your delivery is complete!${tipText}`,
            { requestId, type: 'status_change', role: 'sender', url: `/requests/${requestId}` }
          );
        }
        if (commuterId) {
          await sendNotificationToUser(
            commuterId,
            'Delivery Complete! 🎉',
            `Great job! Delivery completed.${tipText}`,
            { requestId, type: 'status_change', role: 'helper', url: `/requests/${requestId}` }
          );
        }
        break;
    }

    // Handle payment confirmation separately
    if (before.paymentConfirmed !== after.paymentConfirmed && after.paymentConfirmed) {
      if (senderId) {
        await sendNotificationToUser(
          senderId,
          'Payment Confirmed! 💰',
          'The tip payment has been confirmed.',
          { requestId, type: 'payment', role: 'sender', url: `/requests/${requestId}` }
        );
      }
      if (commuterId) {
        await sendNotificationToUser(
          commuterId,
          'Payment Received! 💰',
          `You received $${tipAmount} tip!`,
          { requestId, type: 'payment', role: 'helper', url: `/requests/${requestId}` }
        );
      }
    }

    // Handle arrival notifications
    if (before.arrivedAtPickup !== after.arrivedAtPickup && after.arrivedAtPickup) {
      if (senderId) {
        await sendNotificationToUser(
          senderId,
          'Helper Arrived! 📍',
          'Your helper has arrived at the pickup location.',
          { requestId, type: 'arrival', role: 'sender', url: `/requests/${requestId}` }
        );
      }
    }

    if (before.arrivedAtDrop !== after.arrivedAtDrop && after.arrivedAtDrop) {
      if (senderId) {
        await sendNotificationToUser(
          senderId,
          'Helper Arrived at Drop-off! 📍',
          'Your helper has arrived at the drop-off location.',
          { requestId, type: 'arrival', role: 'sender', url: `/requests/${requestId}` }
        );
      }
    }

    return null;
  }
);

// Legacy function - now handled by onRequestStatusChange
// Keeping for backward compatibility but it won't trigger since status changes are handled above

// Scheduled function to check for nearby tasks and notify users
exports.checkNearbyTasks = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'Asia/Singapore',
  },
  async (event) => {
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
exports.onNewRequestCreated = onDocumentCreated(
  'requests/{requestId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return null;
    
    const request = snap.data();
    const requestId = event.params.requestId;

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

      // Skip if this request was created by a commuter (don't notify them about their own request)
      if (request.senderId) {
        // Check if sender is in the commuters list and skip them
        const senderDoc = await db.collection('users').doc(request.senderId).get();
        if (senderDoc.exists) {
          const senderData = senderDoc.data();
          // If sender is also a commuter, they shouldn't get notified about their own request
          // This is handled by checking senderId below
        }
      }

      // For each commuter, check if they're nearby (within 10km)
      // Only notify if user has location data and is within range
      // EXCLUDE the sender (they created this request)
      const notifications = [];
      commutersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (!userData.fcmToken) return;
        
        // Don't notify the sender about their own request
        if (userDoc.id === request.senderId) return;
        
        // Check if user has location data (stored in user document)
        // If user has currentLat/currentLng, calculate distance
        if (userData.currentLat && userData.currentLng) {
          const distance = calculateDistance(
            userData.currentLat,
            userData.currentLng,
            request.pickupLat,
            request.pickupLng
          );
          
          // Only notify if within 10km
          if (distance <= 10) {
            notifications.push({
              userId: userDoc.id,
              fcmToken: userData.fcmToken,
              distance: distance,
            });
          }
        } else {
          // If no location data, don't notify (to avoid spam)
          // In future, you could allow users to opt-in to general notifications
        }
      });

      // Sort by distance and send to closest users first (limit to 20)
      notifications.sort((a, b) => a.distance - b.distance);
      const limitedNotifications = notifications.slice(0, 20);
      
      for (const notification of limitedNotifications) {
        try {
          const distanceText = notification.distance < 1 
            ? `${Math.round(notification.distance * 1000)}m away`
            : `${notification.distance.toFixed(1)}km away`;
            
          await admin.messaging().send({
            notification: {
              title: '📦 New Request Near You',
              body: `A new delivery request is available ${distanceText} at ${request.pickupPincode}. Check it out!`,
            },
            data: {
              type: 'nearby_request',
              requestId: requestId,
              url: `/requests/${requestId}`,
            },
            token: notification.fcmToken,
            webpush: {
              fcmOptions: {
                link: `/requests/${requestId}`,
              },
              notification: {
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
              },
            },
            android: { priority: 'high' },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                },
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

