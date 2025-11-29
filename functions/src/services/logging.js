/**
 * Logging Service
 * Immutable, append-only logging for liability protection
 */

const admin = require('firebase-admin');
const crypto = require('crypto');
const {encryptData} = require('../middleware/security');

const db = admin.firestore();

/**
 * Create immutable log entry with hash signature
 * @param {string} collection - Collection name
 * @param {Object} logData - Log data object
 * @returns {Promise<string>} Log document ID
 */
async function createImmutableLog(collection, logData) {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  const logId = db.collection(collection).doc().id;

  // Create log entry
  const logEntry = {
    ...logData,
    timestamp,
    logId,
    createdAt: timestamp,
  };

  // Generate hash signature for immutability verification
  const logString = JSON.stringify(logEntry);
  const hash = crypto.createHash('sha256').update(logString).digest('hex');
  logEntry.hashSignature = hash;

  // Store in Firestore (append-only)
  await db.collection(collection).doc(logId).set(logEntry);

  return logId;
}

/**
 * Log task creation
 * @param {Object} taskData - Task data
 * @param {Object} metadata - Metadata (userId, deviceInfo, IP, etc.)
 * @returns {Promise<string>} Log ID
 */
async function logTaskCreation(taskData, metadata) {
  const logData = {
    eventType: 'task_created',
    taskId: taskData.id || taskData.requestId,
    senderId: taskData.senderId,
    itemDescription: taskData.itemDescription, // Snapshot for liability
    itemPhoto: taskData.itemPhoto || null,
    pickupLocation: {
      pincode: taskData.pickupPincode,
      details: taskData.pickupDetails,
      lat: taskData.pickupLat,
      lng: taskData.pickupLng,
    },
    dropLocation: {
      pincode: taskData.dropPincode,
      details: taskData.dropDetails,
      lat: taskData.dropLat,
      lng: taskData.dropLng,
    },
    metadata: {
      userId: metadata.userId,
      deviceFingerprint: metadata.deviceFingerprint,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      timestamp: new Date().toISOString(),
    },
    validationResults: {
      itemValidation: metadata.itemValidation || null,
      mrtValidation: metadata.mrtValidation || null,
      userConfirmation: metadata.userConfirmation || false,
    },
  };

  return await createImmutableLog('task_logs', logData);
}

/**
 * Log task event (pickup, transfer, delivered, etc.)
 * @param {string} taskId - Task ID
 * @param {string} eventType - Event type
 * @param {Object} eventData - Event data
 * @param {Object} metadata - Metadata
 * @returns {Promise<string>} Log ID
 */
async function logTaskEvent(taskId, eventType, eventData, metadata) {
  const logData = {
    eventType,
    taskId,
    senderId: eventData.senderId || null,
    commuterId: eventData.commuterId || null,
    status: eventData.status || null,
    location: eventData.location || null,
    photos: eventData.photos || null, // Before/after pickup photos
    otpVerified: eventData.otpVerified || false,
    metadata: {
      userId: metadata.userId,
      deviceFingerprint: metadata.deviceFingerprint,
      ipAddress: metadata.ipAddress,
      timestamp: new Date().toISOString(),
    },
  };

  return await createImmutableLog('task_events', logData);
}

/**
 * Log user-to-user chat message
 * @param {string} taskId - Task ID
 * @param {string} senderId - Message sender ID
 * @param {string} receiverId - Message receiver ID
 * @param {string} message - Message text
 * @param {Object} metadata - Metadata
 * @param {boolean} wasFiltered - Whether message was filtered
 * @returns {Promise<string>} Log ID
 */
async function logChatMessage(taskId, senderId, receiverId, message, metadata, wasFiltered = false) {
  // Encrypt message content for privacy (decryptable by admin only)
  const encryptionKey = process.env.LOG_ENCRYPTION_KEY || 'default-key-change-in-production';
  const encryptedMessage = encryptData(message, encryptionKey);

  const logData = {
    eventType: 'chat_message',
    taskId,
    senderId,
    receiverId,
    messageEncrypted: encryptedMessage,
    messageLength: message.length,
    wasFiltered,
    metadata: {
      deviceFingerprint: metadata.deviceFingerprint,
      ipAddress: metadata.ipAddress,
      timestamp: new Date().toISOString(),
    },
  };

  return await createImmutableLog('chat_logs', logData);
}

/**
 * Log payment/tip confirmation
 * @param {string} taskId - Task ID
 * @param {string} senderId - Sender ID
 * @param {string} commuterId - Commuter ID
 * @param {number} amount - Amount (if disclosed)
 * @param {Object} metadata - Metadata
 * @returns {Promise<string>} Log ID
 */
async function logPaymentConfirmation(taskId, senderId, commuterId, amount, metadata) {
  const logData = {
    eventType: 'payment_confirmation',
    taskId,
    senderId,
    commuterId,
    amount: amount || null, // Optional, user-led payment
    paymentMethod: 'PayNow', // Only PayNow allowed
    confirmed: true,
    metadata: {
      userId: metadata.userId,
      deviceFingerprint: metadata.deviceFingerprint,
      ipAddress: metadata.ipAddress,
      timestamp: new Date().toISOString(),
    },
  };

  return await createImmutableLog('payment_logs', logData);
}

/**
 * Log blocked/rejected task attempt
 * @param {string} userId - User ID
 * @param {string} reason - Rejection reason
 * @param {Object} taskData - Task data that was blocked
 * @param {Object} metadata - Metadata
 * @returns {Promise<string>} Log ID
 */
async function logBlockedAttempt(userId, reason, taskData, metadata) {
  const logData = {
    eventType: 'task_blocked',
    userId,
    reason,
    itemDescription: taskData.itemDescription,
    matchedKeywords: taskData.matchedKeywords || [],
    taskData: {
      pickupPincode: taskData.pickupPincode,
      dropPincode: taskData.dropPincode,
    },
    metadata: {
      deviceFingerprint: metadata.deviceFingerprint,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      timestamp: new Date().toISOString(),
    },
  };

  return await createImmutableLog('blocked_attempts', logData);
}

/**
 * Export logs for law enforcement (admin only)
 * @param {string} taskId - Task ID (optional)
 * @param {string} userId - User ID (optional)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Exported logs
 */
async function exportLogsForLawEnforcement(taskId, userId, startDate, endDate) {
  const logs = {
    exportedAt: new Date().toISOString(),
    exportedBy: 'admin', // Should be actual admin ID
    taskLogs: [],
    taskEvents: [],
    chatLogs: [],
    blockedAttempts: [],
  };

  // Export task logs
  let query = db.collection('task_logs');
  if (taskId) query = query.where('taskId', '==', taskId);
  if (userId) query = query.where('metadata.userId', '==', userId);
  if (startDate) query = query.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate));
  if (endDate) query = query.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(endDate));

  const taskLogsSnapshot = await query.get();
  taskLogsSnapshot.forEach((doc) => {
    logs.taskLogs.push({id: doc.id, ...doc.data()});
  });

  // Export task events
  query = db.collection('task_events');
  if (taskId) query = query.where('taskId', '==', taskId);
  if (startDate) query = query.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate));
  if (endDate) query = query.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(endDate));

  const taskEventsSnapshot = await query.get();
  taskEventsSnapshot.forEach((doc) => {
    logs.taskEvents.push({id: doc.id, ...doc.data()});
  });

  // Export chat logs (decrypted)
  query = db.collection('chat_logs');
  if (taskId) query = query.where('taskId', '==', taskId);
  if (startDate) query = query.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate));
  if (endDate) query = query.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(endDate));

  const chatLogsSnapshot = await query.get();
  const {decryptData} = require('../middleware/security');
  const encryptionKey = process.env.LOG_ENCRYPTION_KEY || 'default-key-change-in-production';

  chatLogsSnapshot.forEach((doc) => {
    const logData = doc.data();
    if (logData.messageEncrypted) {
      try {
        logData.messageDecrypted = decryptData(logData.messageEncrypted, encryptionKey);
      } catch (error) {
        logData.messageDecrypted = '[DECRYPTION_ERROR]';
      }
    }
    logs.chatLogs.push({id: doc.id, ...logData});
  });

  // Export blocked attempts
  query = db.collection('blocked_attempts');
  if (userId) query = query.where('userId', '==', userId);
  if (startDate) query = query.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate));
  if (endDate) query = query.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(endDate));

  const blockedAttemptsSnapshot = await query.get();
  blockedAttemptsSnapshot.forEach((doc) => {
    logs.blockedAttempts.push({id: doc.id, ...doc.data()});
  });

  return logs;
}

module.exports = {
  createImmutableLog,
  logTaskCreation,
  logTaskEvent,
  logChatMessage,
  logPaymentConfirmation,
  logBlockedAttempt,
  exportLogsForLawEnforcement,
};

