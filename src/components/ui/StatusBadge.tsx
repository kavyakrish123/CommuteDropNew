import { RequestStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: RequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<RequestStatus, { color: string; label: string }> = {
    created: { color: "bg-green-100 text-green-800", label: "Created" },
    accepted: { color: "bg-blue-100 text-blue-800", label: "Accepted" },
    waiting_pickup: { color: "bg-yellow-100 text-yellow-800", label: "Waiting Pickup" },
    pickup_otp_pending: { color: "bg-orange-100 text-orange-800", label: "OTP Pending" },
    picked: { color: "bg-purple-100 text-purple-800", label: "Picked" },
    in_transit: { color: "bg-indigo-100 text-indigo-800", label: "In Transit" },
    delivered: { color: "bg-teal-100 text-teal-800", label: "Delivered" },
    completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
    cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    expired: { color: "bg-gray-100 text-gray-600", label: "Expired" },
  };

  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

