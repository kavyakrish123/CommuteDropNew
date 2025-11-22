import Link from "next/link";
import { DeliveryRequest } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";

interface RequestCardProps {
  request: DeliveryRequest;
  showActions?: boolean;
  onAccept?: () => void;
}

export function RequestCard({
  request,
  showActions = false,
  onAccept,
}: RequestCardProps) {
  const createdAt = request.createdAt
    ? format(request.createdAt.toDate(), "MMM d, yyyy")
    : "Unknown";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <StatusBadge status={request.status} />
        <span className="text-xs text-gray-500">{createdAt}</span>
      </div>

      <div className="space-y-2 mb-3">
        <div>
          <p className="text-sm text-gray-600">Pickup</p>
          <p className="font-medium">
            {request.pickupPincode} - {request.pickupDetails}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Drop</p>
          <p className="font-medium">
            {request.dropPincode} - {request.dropDetails}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Item</p>
          <p className="font-medium">{request.itemDescription}</p>
        </div>
        {request.priceOffered && (
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              ${request.priceOffered}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {request.id && (
          <Link
            href={`/requests/${request.id}`}
            className="flex-1 text-center bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            View
          </Link>
        )}
        {showActions && onAccept && request.status === "open" && (
          <button
            onClick={onAccept}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Accept
          </button>
        )}
      </div>
    </div>
  );
}

