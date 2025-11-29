"use client";

import { useState } from "react";

interface PayNowQRDisplayProps {
  qrCodeUrl: string;
  userName: string;
  isSender?: boolean;
}

export function PayNowQRDisplay({ qrCodeUrl, userName, isSender = false }: PayNowQRDisplayProps) {
  const [showQR, setShowQR] = useState(false);

  if (!qrCodeUrl) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {isSender ? "Sender's" : "Rider's"} PayNow QR
          </p>
          <p className="text-xs text-gray-600">
            Scan to make payment to {userName}
          </p>
        </div>
        <button
          onClick={() => setShowQR(!showQR)}
          className="px-4 py-2 bg-[#00C57E] text-white rounded-soft text-sm font-medium hover:bg-[#00A869] transition-colors"
        >
          {showQR ? "Hide QR" : "Show QR"}
        </button>
      </div>

      {showQR && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-col items-center">
          <img
            src={qrCodeUrl}
            alt={`${userName}'s PayNow QR Code`}
            className="w-64 h-64 object-contain rounded-lg border-2 border-gray-200 bg-white p-2"
          />
          <p className="text-xs text-gray-600 mt-3 text-center">
            Scan this QR code with your banking app to make payment
          </p>
        </div>
      )}
    </div>
  );
}

