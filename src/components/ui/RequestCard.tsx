import Link from "next/link";
import { DeliveryRequest } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { CountdownTimer } from "./CountdownTimer";
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-full min-h-[420px] max-h-[500px]">
      {/* Header - Fixed height */}
      <div className="flex justify-between items-start mb-3 px-4 pt-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap min-h-[28px] flex-1">
          <StatusBadge status={request.status} />
          {isMyRequest && (
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded whitespace-nowrap">
              Your Request
            </span>
          )}
          {isMyTask && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded whitespace-nowrap">
              Your Task
            </span>
          )}
          {request.status === "created" && request.expiresAt && (
            <CountdownTimer expiresAt={request.expiresAt} />
          )}
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">{createdAt}</span>
      </div>

      {/* Content - Flexible, grows to fill space */}
      <div className="flex-1 px-4 space-y-2.5 mb-3 overflow-hidden">
        {request.itemPhoto && (
          <div className="w-full h-32 rounded-lg overflow-hidden mb-2 bg-gray-100 flex-shrink-0">
            <img
              src={request.itemPhoto}
              alt="Item"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="min-h-[44px]">
          <p className="text-xs text-gray-500 mb-0.5">Pickup</p>
          <p className="font-medium text-sm truncate" title={`${request.pickupPincode}${request.pickupDetails ? ` - ${request.pickupDetails}` : ''}`}>
            {request.pickupPincode}
            {request.pickupDetails && ` - ${request.pickupDetails}`}
          </p>
        </div>
        <div className="min-h-[44px]">
          <p className="text-xs text-gray-500 mb-0.5">Drop</p>
          <p className="font-medium text-sm truncate" title={`${request.dropPincode}${request.dropDetails ? ` - ${request.dropDetails}` : ''}`}>
            {request.dropPincode}
            {request.dropDetails && ` - ${request.dropDetails}`}
          </p>
        </div>
        <div className="min-h-[64px]">
          <p className="text-xs text-gray-500 mb-0.5">Item</p>
          <p className="font-medium text-sm line-clamp-2 mb-1" title={request.itemDescription}>{request.itemDescription}</p>
          {request.category && (
            <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
              {request.category}
            </span>
          )}
        </div>
        <div className="min-h-[24px]">
          {request.priceOffered ? (
            <p className="text-sm font-semibold text-indigo-600">
              ${request.priceOffered}
            </p>
          ) : (
            <span className="invisible">$0</span>
          )}
        </div>
      </div>

      {/* Buttons - Fixed at bottom */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2 items-stretch">
          {request.id && (
            <Link
              href={`/requests/${request.id}`}
              className="flex-1 text-center bg-indigo-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors min-h-[40px] flex items-center justify-center"
            >
              View
            </Link>
          )}
          {showActions && onAccept && request.status === "created" && (
            <button
              onClick={onAccept}
              className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors min-h-[40px]"
            >
              Request to Deliver
            </button>
          )}
          {onCancel && request.status === "created" && (
            <button
              onClick={onCancel}
              className="bg-red-600 text-white py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors min-h-[40px] whitespace-nowrap"
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

