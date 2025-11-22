/**
 * Geolocation utilities for distance calculation and geocoding
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Get user's current location using browser Geolocation API
 */
export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Geocode Singapore postal code to lat/lng
 * Note: This is a simplified implementation. For production, use Google Geocoding API
 * or OneMap API (Singapore's official geocoding service)
 */
export async function geocodePostalCode(
  postalCode: string
): Promise<{ lat: number; lng: number } | null> {
  // OneMap API (Singapore's official geocoding service)
  // Note: OneMap API may require authentication for production use
  // For now, we'll try without auth (may have rate limits)
  
  try {
    // OneMap Search API - no auth required for basic search
    const response = await fetch(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(postalCode)}&returnGeom=Y&getAddrDetails=Y`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      console.warn("OneMap API error, falling back to null");
      return null;
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      // OneMap returns LATITUDE and LONGITUDE in uppercase
      if (result.LATITUDE && result.LONGITUDE) {
        return {
          lat: parseFloat(result.LATITUDE),
          lng: parseFloat(result.LONGITUDE),
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error geocoding postal code:", error);
    // Fallback: return null (tasks without geolocation will still work, just won't be sorted by distance)
    return null;
  }
}

/**
 * Sort requests by distance from a reference location
 */
export function sortByDistance<T extends { pickupLat?: number | null; pickupLng?: number | null }>(
  requests: T[],
  referenceLat: number,
  referenceLng: number,
  maxDistanceKm: number = 10 // Default 10km radius
): T[] {
  return requests
    .map((req) => {
      if (req.pickupLat && req.pickupLng) {
        const distance = calculateDistance(
          referenceLat,
          referenceLng,
          req.pickupLat,
          req.pickupLng
        );
        return { ...req, distance };
      }
      return { ...req, distance: Infinity }; // Tasks without location go to end
    })
    .filter((req: any) => req.distance <= maxDistanceKm)
    .sort((a: any, b: any) => a.distance - b.distance)
    .map((req: any) => {
      const { distance, ...rest } = req;
      return rest as T;
    });
}

