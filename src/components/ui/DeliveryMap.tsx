"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
// Use CDN URLs for marker icons to avoid Next.js static file issues
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface DeliveryMapProps {
  pickupLat: number | null | undefined;
  pickupLng: number | null | undefined;
  dropLat: number | null | undefined;
  dropLng: number | null | undefined;
  riderLat: number | null | undefined;
  riderLng: number | null | undefined;
  centerLat: number;
  centerLng: number;
}

// Component to auto-fit map bounds
function MapBounds({ 
  pickupLat, 
  pickupLng, 
  dropLat, 
  dropLng, 
  riderLat, 
  riderLng 
}: {
  pickupLat: number | null | undefined;
  pickupLng: number | null | undefined;
  dropLat: number | null | undefined;
  dropLng: number | null | undefined;
  riderLat: number | null | undefined;
  riderLng: number | null | undefined;
}) {
  const map = useMap();
  
  useEffect(() => {
    const bounds: L.LatLngTuple[] = [];
    
    if (pickupLat && pickupLng) {
      bounds.push([pickupLat, pickupLng]);
    }
    if (dropLat && dropLng) {
      bounds.push([dropLat, dropLng]);
    }
    if (riderLat && riderLng) {
      bounds.push([riderLat, riderLng]);
    }
    
    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      });
    }
  }, [map, pickupLat, pickupLng, dropLat, dropLng, riderLat, riderLng]);
  
  return null;
}

export function DeliveryMap({
  pickupLat,
  pickupLng,
  dropLat,
  dropLng,
  riderLat,
  riderLng,
  centerLat,
  centerLng,
}: DeliveryMapProps) {
  // Create custom icons using HTML div elements (simpler than SVG base64)
  const createCustomIcon = (color: string, label: string, size: number = 32) => {
    const iconHtml = `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size * 0.4}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${label}</div>
    `;
    
    return L.divIcon({
      html: iconHtml,
      className: "custom-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  const pickupIcon = createCustomIcon("#10b981", "P", 32);
  const dropIcon = createCustomIcon("#ef4444", "D", 32);
  const riderIcon = createCustomIcon("#3b82f6", "R", 36);

  // Build polyline positions
  const polylinePositions: L.LatLngTuple[] = [];
  if (pickupLat && pickupLng) {
    polylinePositions.push([pickupLat, pickupLng]);
  }
  if (riderLat && riderLng) {
    polylinePositions.push([riderLat, riderLng]);
  }
  if (dropLat && dropLng) {
    polylinePositions.push([dropLat, dropLng]);
  }

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={13}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      scrollWheelZoom={true}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapBounds
        pickupLat={pickupLat}
        pickupLng={pickupLng}
        dropLat={dropLat}
        dropLng={dropLng}
        riderLat={riderLat}
        riderLng={riderLng}
      />
      
      {/* Pickup marker */}
      {pickupLat && pickupLng && (
        <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-green-600">Pickup Location</p>
              <p className="text-sm text-gray-600">{pickupLat.toFixed(6)}, {pickupLng.toFixed(6)}</p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Rider marker */}
      {riderLat && riderLng && (
        <Marker position={[riderLat, riderLng]} icon={riderIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-blue-600">Rider Location</p>
              <p className="text-sm text-gray-600">{riderLat.toFixed(6)}, {riderLng.toFixed(6)}</p>
              <p className="text-xs text-gray-500 mt-1">Live tracking active</p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Drop marker */}
      {dropLat && dropLng && (
        <Marker position={[dropLat, dropLng]} icon={dropIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-red-600">Drop Location</p>
              <p className="text-sm text-gray-600">{dropLat.toFixed(6)}, {dropLng.toFixed(6)}</p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Route polyline */}
      {polylinePositions.length >= 2 && (
        <Polyline
          positions={polylinePositions}
          color="#3b82f6"
          weight={4}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}
      
      {/* Route from pickup to rider */}
      {pickupLat && pickupLng && riderLat && riderLng && (
        <Polyline
          positions={[[pickupLat, pickupLng], [riderLat, riderLng]]}
          color="#10b981"
          weight={3}
          opacity={0.6}
        />
      )}
      
      {/* Route from rider to drop */}
      {riderLat && riderLng && dropLat && dropLng && (
        <Polyline
          positions={[[riderLat, riderLng], [dropLat, dropLng]]}
          color="#3b82f6"
          weight={3}
          opacity={0.6}
        />
      )}
    </MapContainer>
  );
}

