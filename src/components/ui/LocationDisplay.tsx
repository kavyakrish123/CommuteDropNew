"use client";

import { useState, useEffect } from "react";
import { MapLinkButton } from "./MapLinkButton";
import { getLocationName } from "@/lib/utils/pincodeToAddress";

interface LocationDisplayProps {
  type: "pickup" | "drop";
  pincode: string;
  details?: string | null;
  label?: string;
  showMapButton?: boolean;
}

export function LocationDisplay({
  type,
  pincode,
  details,
  label,
  showMapButton = true,
}: LocationDisplayProps) {
  const isPickup = type === "pickup";
  const displayLabel = label || (isPickup ? "PICKUP" : "DROP OFF");
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch address from pincode
    const fetchLocation = async () => {
      try {
        const name = await getLocationName(pincode);
        setLocationName(name);
      } catch (error) {
        console.error("Error fetching location:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [pincode]);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              isPickup ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {isPickup ? (
              <svg
                className={`w-6 h-6 ${isPickup ? "text-green-600" : "text-red-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </div>

          {/* Location Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              {displayLabel}
            </p>
            {loading ? (
              <p className="text-lg font-bold text-gray-900 mb-0.5">{pincode}</p>
            ) : (
              <>
                <p className="text-base font-bold text-gray-900 mb-0.5">
                  {locationName || pincode}
                </p>
                {locationName && locationName !== pincode && (
                  <p className="text-xs text-gray-500 mb-1">{pincode}</p>
                )}
              </>
            )}
            {details && (
              <p className="text-sm text-gray-600 truncate mt-1">{details}</p>
            )}
          </div>
        </div>

        {/* Map Button */}
        {showMapButton && (
          <div className="flex-shrink-0">
            <MapLinkButton pincode={pincode} details={details || undefined} type={type} />
          </div>
        )}
      </div>
    </div>
  );
}

