/**
 * Validation Middleware
 * Core validation functions for item safety, MRT compliance, and user verification
 */

const {RESTRICTED_KEYWORDS, RESTRICTED_PATTERNS, SUSPICIOUS_PHRASES} = require('../config/restrictedItems');
const crypto = require('crypto');

/**
 * Validate item description against restricted items
 * @param {string} description - Item description text
 * @returns {Object} {isValid: boolean, reason: string, matchedKeywords: string[]}
 */
function validateItemDescription(description) {
  if (!description || typeof description !== 'string') {
    return {
      isValid: false,
      reason: 'Item description is required',
      matchedKeywords: [],
    };
  }

  const lowerDescription = description.toLowerCase();
  const matchedKeywords = [];
  const matchedPatterns = [];

  // Check against restricted keywords
  for (const keyword of RESTRICTED_KEYWORDS) {
    if (lowerDescription.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }

  // Check against restricted patterns
  for (const pattern of RESTRICTED_PATTERNS) {
    if (pattern.test(description)) {
      matchedPatterns.push(pattern.toString());
    }
  }

  // Check for suspicious phrases
  const matchedPhrases = [];
  for (const phrase of SUSPICIOUS_PHRASES) {
    if (lowerDescription.includes(phrase.toLowerCase())) {
      matchedPhrases.push(phrase);
    }
  }

  if (matchedKeywords.length > 0 || matchedPatterns.length > 0 || matchedPhrases.length > 0) {
    return {
      isValid: false,
      reason: 'Item contains restricted or prohibited keywords',
      matchedKeywords: [...matchedKeywords, ...matchedPhrases],
      matchedPatterns,
    };
  }

  return {
    isValid: true,
    reason: null,
    matchedKeywords: [],
  };
}

/**
 * Validate MRT-safe rules
 * @param {Object} itemData - Item data object
 * @returns {Object} {isValid: boolean, reason: string}
 */
function validateMRTSafeRules(itemData) {
  const errors = [];

  // Weight check (< 1kg)
  if (itemData.weight && itemData.weight >= 1) {
    errors.push('Item weight must be less than 1kg');
  }

  // Size check (< 25cm width, approximate)
  if (itemData.width && itemData.width >= 25) {
    errors.push('Item width must be less than 25cm');
  }

  if (itemData.height && itemData.height >= 25) {
    errors.push('Item height must be less than 25cm');
  }

  if (itemData.length && itemData.length >= 25) {
    errors.push('Item length must be less than 25cm');
  }

  // Fragile items warning (not blocked, but flagged)
  if (itemData.isFragile === true) {
    // This is allowed but requires confirmation
  }

  // Multiple items check
  if (itemData.quantity && itemData.quantity > 1) {
    const totalWeight = (itemData.weight || 0) * itemData.quantity;
    if (totalWeight >= 1) {
      errors.push('Total weight of multiple items must be less than 1kg');
    }
  }

  // Temperature-sensitive items
  if (itemData.requiresRefrigeration === true || itemData.requiresFreezing === true) {
    errors.push('Temperature-sensitive items are not allowed');
  }

  // Leaking items
  if (itemData.isLeaking === true || itemData.mayLeak === true) {
    errors.push('Leaking or potentially leaking items are not allowed');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      reason: errors.join('; '),
    };
  }

  return {
    isValid: true,
    reason: null,
  };
}

/**
 * Generate device fingerprint hash
 * @param {Object} deviceInfo - Device information object
 * @returns {string} Hashed device fingerprint
 */
function generateDeviceFingerprint(deviceInfo) {
  const fingerprintString = JSON.stringify({
    userAgent: deviceInfo.userAgent || '',
    platform: deviceInfo.platform || '',
    language: deviceInfo.language || '',
    timezone: deviceInfo.timezone || '',
    screenResolution: deviceInfo.screenResolution || '',
    // Note: IP address should be handled separately and not included in fingerprint
  });

  return crypto.createHash('sha256').update(fingerprintString).digest('hex');
}

/**
 * Validate user confirmation for restricted items
 * @param {boolean} confirmation - User confirmation flag
 * @returns {boolean}
 */
function validateUserConfirmation(confirmation) {
  return confirmation === true;
}

/**
 * Validate phone number format (Singapore)
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
function validateSingaporePhone(phone) {
  // Singapore phone format: +65XXXXXXXX (8 digits after +65)
  const singaporePhoneRegex = /^\+65[689]\d{7}$/;
  return singaporePhoneRegex.test(phone);
}

/**
 * Validate postal code format (Singapore)
 * @param {string} postalCode - Postal code
 * @returns {boolean}
 */
function validateSingaporePostalCode(postalCode) {
  // Singapore postal codes are 6 digits
  const postalCodeRegex = /^\d{6}$/;
  return postalCodeRegex.test(postalCode);
}

module.exports = {
  validateItemDescription,
  validateMRTSafeRules,
  generateDeviceFingerprint,
  validateUserConfirmation,
  validateSingaporePhone,
  validateSingaporePostalCode,
};

