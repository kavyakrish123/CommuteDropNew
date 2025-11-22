"use client";

export function PlatformDisclaimer() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Platform Notice:</strong> CommuteDrop is a peer-to-peer marketplace, not a
            logistics company. We facilitate connections between users but are not responsible
            for deliveries, disputes, or payments. All transactions are between users directly.
          </p>
        </div>
      </div>
    </div>
  );
}

