/**
 * Auto-Flagging Engine
 * Rule engine that auto-detects risky actions and suspicious behavior
 */

const admin = require('firebase-admin');
const {validateItemDescription} = require('../middleware/validation');
const {logBlockedAttempt} = require('./logging');

const db = admin.firestore();

// Auto-flagging thresholds
const THRESHOLDS = {
  MAX_TASKS_PER_DAY: 5, // Maximum tasks a user can create per day
  MAX_ACCEPTED_BUT_NOT_COMPLETED: 3, // Commuter accepts but never completes
  SUSPICIOUS_MESSAGE_KEYWORDS: ['don\'t tell', 'illegal', 'hide', 'secret', 'off platform', 'cash only'],
  FLAG_SCORE_THRESHOLD: 3, // Auto-flag if score reaches this
};

/**
 * Check if user has created too many tasks in a day
 * @param {string} userId - User ID
 * @returns {Promise<Object>} {isFlagged: boolean, count: number, reason: string}
 */
async function checkTaskCreationFrequency(userId) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDayTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);

  const tasksSnapshot = await db
    .collection('requests')
    .where('senderId', '==', userId)
    .where('createdAt', '>=', startOfDayTimestamp)
    .get();

  const count = tasksSnapshot.size;

  if (count >= THRESHOLDS.MAX_TASKS_PER_DAY) {
    return {
      isFlagged: true,
      count,
      reason: `User has created ${count} tasks today (limit: ${THRESHOLDS.MAX_TASKS_PER_DAY})`,
    };
  }

  return {
    isFlagged: false,
    count,
    reason: null,
  };
}

/**
 * Check if commuter repeatedly accepts but never completes
 * @param {string} userId - User ID
 * @returns {Promise<Object>} {isFlagged: boolean, count: number, reason: string}
 */
async function checkCommuterCompletionRate(userId) {
  const acceptedTasksSnapshot = await db
    .collection('requests')
    .where('commuterId', '==', userId)
    .where('status', 'in', ['approved', 'waiting_pickup', 'pickup_otp_pending', 'picked', 'in_transit'])
    .get();

  const completedTasksSnapshot = await db
    .collection('requests')
    .where('commuterId', '==', userId)
    .where('status', '==', 'completed')
    .get();

  const acceptedCount = acceptedTasksSnapshot.size;
  const completedCount = completedTasksSnapshot.size;

  // Check if user has accepted many but completed few
  if (acceptedCount >= THRESHOLDS.MAX_ACCEPTED_BUT_NOT_COMPLETED && completedCount === 0) {
    return {
      isFlagged: true,
      acceptedCount,
      completedCount,
      reason: `Commuter has accepted ${acceptedCount} tasks but completed none`,
    };
  }

  return {
    isFlagged: false,
    acceptedCount,
    completedCount,
    reason: null,
  };
}

/**
 * Check item description for flagged keywords
 * @param {string} description - Item description
 * @returns {Object} {isFlagged: boolean, matchedKeywords: string[], reason: string}
 */
function checkItemDescriptionFlags(description) {
  const validation = validateItemDescription(description);

  if (!validation.isValid) {
    return {
      isFlagged: true,
      matchedKeywords: validation.matchedKeywords,
      reason: validation.reason,
    };
  }

  return {
    isFlagged: false,
    matchedKeywords: [],
    reason: null,
  };
}

/**
 * Check chat messages for suspicious content
 * @param {string} message - Message text
 * @returns {Object} {isFlagged: boolean, matchedKeywords: string[], reason: string}
 */
function checkSuspiciousMessage(message) {
  if (!message || typeof message !== 'string') {
    return {
      isFlagged: false,
      matchedKeywords: [],
      reason: null,
    };
  }

  const lowerMessage = message.toLowerCase();
  const matchedKeywords = [];

  for (const keyword of THRESHOLDS.SUSPICIOUS_MESSAGE_KEYWORDS) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }

  if (matchedKeywords.length > 0) {
    return {
      isFlagged: true,
      matchedKeywords,
      reason: 'Message contains suspicious keywords indicating potential illegal activity',
    };
  }

  return {
    isFlagged: false,
    matchedKeywords: [],
    reason: null,
  };
}

/**
 * Calculate user flag score based on multiple factors
 * @param {string} userId - User ID
 * @returns {Promise<Object>} {score: number, flags: Array, shouldAutoFlag: boolean}
 */
async function calculateUserFlagScore(userId) {
  let score = 0;
  const flags = [];

  // Check task creation frequency
  const taskFrequencyCheck = await checkTaskCreationFrequency(userId);
  if (taskFrequencyCheck.isFlagged) {
    score += 2;
    flags.push({
      type: 'high_task_frequency',
      reason: taskFrequencyCheck.reason,
      severity: 'medium',
    });
  }

  // Check commuter completion rate
  const completionCheck = await checkCommuterCompletionRate(userId);
  if (completionCheck.isFlagged) {
    score += 2;
    flags.push({
      type: 'low_completion_rate',
      reason: completionCheck.reason,
      severity: 'medium',
    });
  }

  // Check for blocked attempts
  const blockedAttemptsSnapshot = await db
    .collection('blocked_attempts')
    .where('userId', '==', userId)
    .get();

  const blockedCount = blockedAttemptsSnapshot.size;
  if (blockedCount >= 3) {
    score += blockedCount;
    flags.push({
      type: 'multiple_blocked_attempts',
      reason: `User has ${blockedCount} blocked task attempts`,
      severity: 'high',
    });
  }

  // Check for previous incidents
  const incidentsSnapshot = await db
    .collection('incidents')
    .where('reportedUserId', '==', userId)
    .where('status', '==', 'confirmed')
    .get();

  const incidentCount = incidentsSnapshot.size;
  if (incidentCount > 0) {
    score += incidentCount * 2;
    flags.push({
      type: 'previous_incidents',
      reason: `User has ${incidentCount} confirmed incident(s)`,
      severity: 'high',
    });
  }

  return {
    score,
    flags,
    shouldAutoFlag: score >= THRESHOLDS.FLAG_SCORE_THRESHOLD,
  };
}

/**
 * Auto-flag user and take action
 * @param {string} userId - User ID
 * @param {string} reason - Reason for flagging
 * @param {string} severity - Severity level (low, medium, high)
 * @returns {Promise<Object>} Action taken
 */
async function autoFlagUser(userId, reason, severity = 'medium') {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const actions = [];

  // Soft ban for 12 hours
  const softBanUntil = new Date();
  softBanUntil.setHours(softBanUntil.getHours() + 12);

  await userRef.update({
    isSoftBanned: true,
    softBanUntil: admin.firestore.Timestamp.fromDate(softBanUntil),
    autoFlagged: true,
    autoFlagReason: reason,
    autoFlaggedAt: admin.firestore.FieldValue.serverTimestamp(),
    flagSeverity: severity,
  });

  actions.push('soft_ban_12h');

  // Cancel all active tasks
  const activeTasksSnapshot = await db
    .collection('requests')
    .where('senderId', '==', userId)
    .where('status', 'in', ['created', 'requested', 'approved', 'waiting_pickup'])
    .get();

  for (const taskDoc of activeTasksSnapshot.docs) {
    await taskDoc.ref.update({
      status: 'cancelled',
      cancellationReason: 'Auto-flagged by system',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    actions.push(`cancelled_task_${taskDoc.id}`);
  }

  // Create incident record for admin review
  await db.collection('incidents').add({
    type: 'auto_flagged',
    reportedUserId: userId,
    reason,
    severity,
    status: 'pending_review',
    autoFlagged: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    actionsTaken: actions,
  });

  // Log the auto-flagging
  await logBlockedAttempt(
    userId,
    `Auto-flagged: ${reason}`,
    {autoFlagged: true},
    {
      deviceFingerprint: 'system',
      ipAddress: 'system',
      userAgent: 'auto-flagging-engine',
    }
  );

  return {
    success: true,
    actions,
    softBanUntil: softBanUntil.toISOString(),
  };
}

module.exports = {
  checkTaskCreationFrequency,
  checkCommuterCompletionRate,
  checkItemDescriptionFlags,
  checkSuspiciousMessage,
  calculateUserFlagScore,
  autoFlagUser,
  THRESHOLDS,
};

