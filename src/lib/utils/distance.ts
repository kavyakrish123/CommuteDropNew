/**
 * Calculate distance between two Singapore postal codes
 * Note: This is a simplified calculation. For production, use a proper geocoding service
 * to convert postal codes to lat/lng coordinates, then use Haversine formula.
 */

// Simplified distance calculation (placeholder)
// In production, you would:
// 1. Use a geocoding API to get lat/lng for postal codes
// 2. Use Haversine formula to calculate distance
export function calculateDistance(
  pincode1: string,
  pincode2: string
): number {
  // Placeholder: Simple numeric difference
  // Real implementation would use geocoding + Haversine
  const num1 = parseInt(pincode1) || 0;
  const num2 = parseInt(pincode2) || 0;
  const diff = Math.abs(num1 - num2);
  
  // Rough approximation: 1 unit difference ≈ 0.1km
  // This is a placeholder - use proper geocoding in production
  return diff * 0.1;
}

/**
 * Filter and sort requests by distance from a reference pincode
 */
export function sortByDistance<T extends { pickupPincode: string }>(
  requests: T[],
  referencePincode: string
): T[] {
  return requests
    .map((req) => ({
      ...req,
      distance: calculateDistance(referencePincode, req.pickupPincode),
    }))
    .sort((a: any, b: any) => a.distance - b.distance)
    .filter((req: any) => req.distance <= 1.0) // 1km radius
    .map((req: any) => {
      const { distance, ...rest } = req;
      return rest as T;
    });
}

