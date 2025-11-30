/**
 * Location validation utilities
 * Supports both Singapore postal codes and manual address input
 */

export interface LocationValidationResult {
  isValid: boolean;
  address?: string;
  lat?: number;
  lng?: number;
  error?: string;
  isPostalCode?: boolean;
}

/**
 * Validate a location (postal code or address) using OneMap API
 * Returns validation result with coordinates if valid
 */
export async function validateLocation(
  input: string
): Promise<LocationValidationResult> {
  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      error: "Location cannot be empty",
    };
  }

  const trimmedInput = input.trim();

  // Check if it's a postal code (6 digits for Singapore)
  const isPostalCode = /^\d{6}$/.test(trimmedInput);

  try {
    // OneMap Search API - supports both postal codes and addresses
    const response = await fetch(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(trimmedInput)}&returnGeom=Y&getAddrDetails=Y`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      return {
        isValid: false,
        error: "Unable to validate location. Please try again.",
        isPostalCode,
      };
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      
      // OneMap returns ADDRESS, LATITUDE, LONGITUDE in uppercase
      if (result.LATITUDE && result.LONGITUDE) {
        const lat = parseFloat(result.LATITUDE);
        const lng = parseFloat(result.LONGITUDE);

        // Validate coordinates are within Singapore bounds
        // Singapore approximate bounds: 1.15°N to 1.47°N, 103.6°E to 104.0°E
        if (lat >= 1.15 && lat <= 1.47 && lng >= 103.6 && lng <= 104.0) {
          return {
            isValid: true,
            address: result.ADDRESS || trimmedInput,
            lat,
            lng,
            isPostalCode,
          };
        } else {
          return {
            isValid: false,
            error: "Location must be within Singapore",
            isPostalCode,
          };
        }
      }
    }

    return {
      isValid: false,
      error: "Location not found. Please enter a valid Singapore address or postal code.",
      isPostalCode,
    };
  } catch (error) {
    console.error("Error validating location:", error);
    return {
      isValid: false,
      error: "Error validating location. Please check your connection and try again.",
      isPostalCode,
    };
  }
}

/**
 * Debounce function for location validation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

