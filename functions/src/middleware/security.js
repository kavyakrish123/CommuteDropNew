/**
 * Security Middleware
 * JWT validation, rate limiting, IP throttling, and encryption utilities
 */

const admin = require('firebase-admin');
const crypto = require('crypto');

// Rate limiting store (in production, use Redis or Firestore)
const rateLimitStore = new Map();
const IP_THROTTLE_STORE = new Map();

// Rate limit configuration
const RATE_LIMITS = {
  createRequest: {max: 5, window: 60 * 60 * 1000}, // 5 per hour
  acceptRequest: {max: 10, window: 60 * 60 * 1000}, // 10 per hour
  sendMessage: {max: 50, window: 60 * 60 * 1000}, // 50 per hour
  reportUser: {max: 3, window: 24 * 60 * 60 * 1000}, // 3 per day
  adminAction: {max: 100, window: 60 * 60 * 1000}, // 100 per hour
};

/**
 * Verify Firebase Auth token
 * @param {string} authToken - Firebase ID token
 * @returns {Promise<Object>} Decoded token
 */
async function verifyAuthToken(authToken) {
  if (!authToken) {
    throw new Error('Authentication token required');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    return decodedToken;
  } catch (error) {
    throw new Error(`Invalid authentication token: ${error.message}`);
  }
}

/**
 * Rate limiting middleware
 * @param {string} userId - User ID
 * @param {string} action - Action type
 * @returns {Object} {allowed: boolean, remaining: number, resetTime: number}
 */
function checkRateLimit(userId, action) {
  const limit = RATE_LIMITS[action] || {max: 10, window: 60 * 60 * 1000};
  const key = `${userId}:${action}`;
  const now = Date.now();

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {count: 1, resetTime: now + limit.window});
    return {
      allowed: true,
      remaining: limit.max - 1,
      resetTime: now + limit.window,
    };
  }

  const record = rateLimitStore.get(key);

  // Reset if window expired
  if (now > record.resetTime) {
    rateLimitStore.set(key, {count: 1, resetTime: now + limit.window});
    return {
      allowed: true,
      remaining: limit.max - 1,
      resetTime: now + limit.window,
    };
  }

  // Check if limit exceeded
  if (record.count >= limit.max) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: limit.max - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * IP throttling for sensitive routes
 * @param {string} ip - IP address
 * @param {string} route - Route identifier
 * @param {number} maxRequests - Maximum requests
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} Whether request is allowed
 */
function checkIPThrottle(ip, route, maxRequests = 10, windowMs = 60 * 1000) {
  const key = `${ip}:${route}`;
  const now = Date.now();

  if (!IP_THROTTLE_STORE.has(key)) {
    IP_THROTTLE_STORE.set(key, {count: 1, resetTime: now + windowMs});
    return true;
  }

  const record = IP_THROTTLE_STORE.get(key);

  if (now > record.resetTime) {
    IP_THROTTLE_STORE.set(key, {count: 1, resetTime: now + windowMs});
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  IP_THROTTLE_STORE.set(key, record);
  return true;
}

/**
 * Hash device identifier
 * @param {string} deviceId - Device identifier
 * @returns {string} Hashed device ID
 */
function hashDeviceId(deviceId) {
  return crypto.createHash('sha256').update(deviceId).digest('hex');
}

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key (from environment)
 * @returns {string} Encrypted text (base64)
 */
function encryptData(text, key) {
  const algorithm = 'aes-256-cbc';
  const encryptionKey = crypto.createHash('sha256').update(key).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  return `${iv.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text
 * @param {string} key - Decryption key (from environment)
 * @returns {string} Decrypted text
 */
function decryptData(encryptedText, key) {
  const algorithm = 'aes-256-cbc';
  const encryptionKey = crypto.createHash('sha256').update(key).digest();
  const [ivBase64, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  
  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Extract IP address from request
 * @param {Object} request - HTTP request object
 * @returns {string} IP address
 */
function extractIPAddress(request) {
  const forwarded = request.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers['x-real-ip'] || request.connection?.remoteAddress || 'unknown';
}

/**
 * Check if user is admin
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
async function isAdmin(userId) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) return false;
    const userData = userDoc.data();
    return userData.isAdmin === true || userData.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

module.exports = {
  verifyAuthToken,
  checkRateLimit,
  checkIPThrottle,
  hashDeviceId,
  encryptData,
  decryptData,
  extractIPAddress,
  isAdmin,
  RATE_LIMITS,
};


