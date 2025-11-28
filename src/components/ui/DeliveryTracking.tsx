"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DeliveryRequest } from "@/lib/types";
import { calculateDistance } from "@/lib/utils/geolocation";
import { MapLinkButton } from "./MapLinkButton";

// Dynamically import map component to avoid SSR issues
const DeliveryMap = dynamic(() => import("./DeliveryMap").then((mod) => ({ default: mod.DeliveryMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface DeliveryTrackingProps {
  request: DeliveryRequest;
}

export function DeliveryTracking({ request }: DeliveryTrackingProps) {
  const [riderLocation, setRiderLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    request.riderLat && request.riderLng
      ? { lat: request.riderLat, lng: request.riderLng }
      : null
  );
  const [distanceToPickup, setDistanceToPickup] = useState<number | null>(null);
  const [distanceToDrop, setDistanceToDrop] = useState<number | null>(null);

  // Update rider location when request changes
  useEffect(() => {
    if (request.riderLat && request.riderLng) {
      setRiderLocation({ lat: request.riderLat, lng: request.riderLng });
    }
  }, [request.riderLat, request.riderLng]);

  // Calculate distances
  useEffect(() => {
    if (!riderLocation) {
      setDistanceToPickup(null);
      setDistanceToDrop(null);
      return;
    }

    if (request.pickupLat && request.pickupLng) {
      const dist = calculateDistance(
        riderLocation.lat,
        riderLocation.lng,
        request.pickupLat,
        request.pickupLng
      );
      setDistanceToPickup(dist);
    }

    if (request.dropLat && request.dropLng) {
      const dist = calculateDistance(
        riderLocation.lat,
        riderLocation.lng,
        request.dropLat,
        request.dropLng
      );
      setDistanceToDrop(dist);
    }
  }, [riderLocation, request.pickupLat, request.pickupLng, request.dropLat, request.dropLng]);

  if (!request.trackingEnabled || !riderLocation) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm font-medium">
            Location tracking is not active
          </p>
        </div>
      </div>
    );
  }

  // Calculate center of all points for map display
  const allLats = [
    request.pickupLat,
    request.dropLat,
    riderLocation.lat,
  ].filter((v): v is number => v !== null && v !== undefined);
  const allLngs = [
    request.pickupLng,
    request.dropLng,
    riderLocation.lng,
  ].filter((v): v is number => v !== null && v !== undefined);

  const centerLat =
    allLats.reduce((a, b) => a + b, 0) / allLats.length;
  const centerLng =
    allLngs.reduce((a, b) => a + b, 0) / allLngs.length;

  // Create Google Maps search URL (opens in new tab, no API key needed)
  const openMapsInNewTab = () => {
    const mapUrl = `https://www.google.com/maps?q=${centerLat},${centerLng}&z=13`;
    window.open(mapUrl, "_blank");
  };

  // Create Google Maps directions URL
  const getDirectionsUrl = () => {
    if (!riderLocation) return null;
    if (request.dropLat && request.dropLng) {
      return `https://www.google.com/maps/dir/${riderLocation.lat},${riderLocation.lng}/${request.dropLat},${request.dropLng}`;
    }
    return null;
  };

  const formatDistance = (km: number | null): string => {
    if (km === null) return "N/A";
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  const formatLastUpdate = (): string => {
    if (!request.lastLocationUpdate) return "Never";
    const now = new Date();
    const updateTime = request.lastLocationUpdate.toDate();
    const diffMs = now.getTime() - updateTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-indigo-600"
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
            <h3 className="text-lg font-semibold text-indigo-900">
              Delivery Tracking
            </h3>
          </div>
          <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
            Active
          </span>
        </div>
        <p className="text-xs text-indigo-700 mt-1">
          Last updated: {formatLastUpdate()}
        </p>
      </div>

      {/* Interactive Map Display */}
      <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
        <DeliveryMap
          pickupLat={request.pickupLat}
          pickupLng={request.pickupLng}
          dropLat={request.dropLat}
          dropLng={request.dropLng}
          riderLat={riderLocation?.lat}
          riderLng={riderLocation?.lng}
          centerLat={centerLat}
          centerLng={centerLng}
        />
        {/* Button to open in external maps */}
        <div className="absolute top-2 right-2 z-[1000]">
          <button
            onClick={openMapsInNewTab}
            className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-md text-sm font-medium flex items-center gap-2 border border-gray-200"
            title="Open in Google Maps"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open
          </button>
        </div>
      </div>

      {/* Location Info */}
      <div className="p-4 space-y-3">
        {/* Distance to Drop */}
        {distanceToDrop !== null && (
          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Distance to Drop
              </span>
            </div>
            <span className="text-lg font-bold text-red-600">
              {formatDistance(distanceToDrop)}
            </span>
          </div>
        )}

        {/* Distance to Pickup */}
        {distanceToPickup !== null && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Distance from Pickup
              </span>
            </div>
            <span className="text-lg font-bold text-green-600">
              {formatDistance(distanceToPickup)}
            </span>
          </div>
        )}

        {/* Legend */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">Legend:</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Pickup</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Rider</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Drop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

