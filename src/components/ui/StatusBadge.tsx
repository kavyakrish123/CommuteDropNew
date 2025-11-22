import { RequestStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: RequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    open: "bg-green-100 text-green-800",
    accepted: "bg-blue-100 text-blue-800",
    picked: "bg-yellow-100 text-yellow-800",
    delivered: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[status]
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

