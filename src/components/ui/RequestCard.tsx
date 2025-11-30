import Link from "next/link";
import { DeliveryRequest } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { CountdownTimer } from "./CountdownTimer";
import { LocationDisplay } from "./LocationDisplay";
import { format } from "date-fns";

interface RequestCardProps {
  request: DeliveryRequest;
  showActions?: boolean;
  onAccept?: () => void;
  onCancel?: () => void;
  currentUserId?: string;
}

export function RequestCard({
  request,
  showActions = false,
  onAccept,
  onCancel,
  currentUserId,
}: RequestCardProps) {
  const createdAt = request.createdAt
    ? format(request.createdAt.toDate(), "MMM d, yyyy")
    : "Unknown";

  const isMyRequest = currentUserId && request.senderId === currentUserId;
  const isMyTask = currentUserId && request.commuterId === currentUserId;

  return (
    <div className="bg-white rounded-soft shadow-card border border-gray-200 flex flex-col h-full min-h-[480px] active:scale-[0.98] transition-transform duration-150 overflow-hidden">
      {/* Header - Status Bar */}
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <StatusBadge status={request.status} />
          {isMyRequest && (
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium whitespace-nowrap">
              Your Request
            </span>
          )}
          {isMyTask && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium whitespace-nowrap">
              Helping Out
            </span>
          )}
        </div>
        {request.status === "created" && request.expiresAt && (
          <CountdownTimer expiresAt={request.expiresAt} />
        )}
      </div>

      {/* Content - Grab-style layout */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden flex flex-col">
        {/* Item Photo */}
        {request.itemPhoto && (
          <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={request.itemPhoto}
              alt="Item"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Pickup Location - Grab Style */}
        <div className="flex-shrink-0">
          <LocationDisplay
            type="pickup"
            pincode={request.pickupPincode}
            details={request.pickupDetails || undefined}
            showMapButton={false}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 px-2 flex-shrink-0">
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full" style={{ marginLeft: '-4px' }}></div>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Drop Location - Grab Style */}
        <div className="flex-shrink-0">
          <LocationDisplay
            type="drop"
            pincode={request.dropPincode}
            details={request.dropDetails || undefined}
            showMapButton={false}
          />
        </div>

        {/* Item Description */}
        <div className="pt-2 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-500 font-medium mb-1">ITEM</p>
          <p className="text-sm font-semibold text-gray-900 line-clamp-2" title={request.itemDescription}>
            {request.itemDescription}
          </p>
          {request.category && (
            <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
              {request.category}
            </span>
          )}
        </div>

        {/* Tip */}
        {request.priceOffered && (
          <div className="flex-shrink-0 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-0.5">TIP</p>
            <p className="text-xl font-bold text-[#00C57E]">${request.priceOffered}</p>
          </div>
        )}
      </div>

      {/* Buttons - Fixed at bottom */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2 items-stretch">
          {request.id && (
            <Link
              href={`/requests/${request.id}`}
              className="flex-1 text-center bg-[#00C57E] text-white py-2.5 px-4 rounded-soft text-sm font-medium hover:bg-[#00A869] active:bg-[#00995A] active:scale-[0.98] transition-all duration-150 min-h-[44px] flex items-center justify-center"
            >
              View
            </Link>
          )}
          {showActions && onAccept && request.status === "created" && (
            <button
              onClick={onAccept}
              className="flex-1 bg-[#00C57E] text-white py-2.5 px-4 rounded-soft text-sm font-medium hover:bg-[#00A869] active:bg-[#00995A] active:scale-[0.98] transition-all duration-150 min-h-[44px]"
            >
              Request to Deliver
            </button>
          )}
          {onCancel && request.status === "created" && (
            <button
              onClick={onCancel}
              className="bg-red-600 text-white py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-red-700 active:bg-red-800 active:scale-[0.98] transition-all duration-150 min-h-[44px] whitespace-nowrap"
              title="Cancel this request"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

