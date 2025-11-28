"use client";

interface MapLinkButtonProps {
  pincode: string;
  details?: string;
  type: "pickup" | "drop";
}

export function MapLinkButton({ pincode, details, type }: MapLinkButtonProps) {
  // Create Google Maps URL for Singapore postal code
  const address = `Singapore ${pincode}${details ? ` ${details}` : ""}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;

  const handleClick = () => {
    // Detect platform and open appropriate maps app
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /android/i.test(userAgent);

    if (isIOS) {
      window.open(appleMapsUrl, "_blank");
    } else if (isAndroid) {
      window.open(googleMapsUrl, "_blank");
    } else {
      // Desktop - prefer Google Maps
      window.open(googleMapsUrl, "_blank");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
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
      <span>Maps</span>
    </button>
  );
}

