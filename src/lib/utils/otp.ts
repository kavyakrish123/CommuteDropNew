/**
 * Generate a random 4-digit OTP
 * Note: For MVP, OTPs are generated on the client side.
 * In production, this should be moved to Firebase Functions for security.
 */
export function generateOTP(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

