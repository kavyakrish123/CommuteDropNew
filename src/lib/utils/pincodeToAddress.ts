/**
 * Convert Singapore postal code to address/location name
 * Uses OneMap API (Singapore's official geocoding service)
 */

export interface AddressResult {
  address: string;
  lat: number;
  lng: number;
}

/**
 * Get address from Singapore postal code
 */
export async function getAddressFromPincode(
  postalCode: string
): Promise<AddressResult | null> {
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
      console.warn("OneMap API error");
      return null;
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      // OneMap returns ADDRESS, LATITUDE, LONGITUDE in uppercase
      if (result.ADDRESS && result.LATITUDE && result.LONGITUDE) {
        return {
          address: result.ADDRESS,
          lat: parseFloat(result.LATITUDE),
          lng: parseFloat(result.LONGITUDE),
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting address from pincode:", error);
    return null;
  }
}

/**
 * Get a friendly location name from postal code
 * Returns address if available, otherwise returns formatted postal code
 */
export async function getLocationName(postalCode: string): Promise<string> {
  const addressData = await getAddressFromPincode(postalCode);
  if (addressData && addressData.address) {
    // Return a shorter version if address is too long
    const address = addressData.address;
    if (address.length > 40) {
      // Try to get a shorter version (building name or area)
      const parts = address.split(',');
      return parts[0] || postalCode;
    }
    return address;
  }
  // Fallback to formatted postal code
  return postalCode;
}

