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
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
    >
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
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span>Open in Maps</span>
    </button>
  );
}

