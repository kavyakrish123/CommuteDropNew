"use client";

import { RequestStatus } from "@/lib/types";

interface ParcelTimelineProps {
  status: RequestStatus;
}

// Simplified steps - only key milestones
const STATUS_STEPS: Array<{ status: RequestStatus; label: string }> = [
  { status: "created", label: "Created" },
  { status: "approved", label: "Approved" },
  { status: "picked", label: "Picked" },
  { status: "completed", label: "Completed" },
];

// Map all statuses to their step index
const getStepIndex = (status: RequestStatus): number => {
  if (status === "created") return 0;
  if (status === "requested") return 0; // Still at created step
  if (status === "approved" || status === "waiting_pickup" || status === "pickup_otp_pending") return 1;
  if (status === "picked") return 2;
  if (status === "in_transit") return 2; // Still at picked step
  if (status === "delivered") return 3; // Legacy: treat as completed
  if (status === "completed") return 3;
  return 0;
};

export function ParcelTimeline({ status }: ParcelTimelineProps) {
  const currentStepIndex = getStepIndex(status);
  const isCompleted = status === "completed" || status === "cancelled" || status === "expired";
  
  // Calculate progress width
  const progressWidth = STATUS_STEPS.length > 1 
    ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 
    : 0;

  return (
    <div className="py-2">
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
        <div
          className="absolute top-4 left-0 h-0.5 bg-indigo-600 transition-all duration-300"
          style={{
            width: `${progressWidth}%`,
          }}
        ></div>

        {/* Status dots */}
        <div className="relative flex justify-between items-center">
          {STATUS_STEPS.map((step, index) => {
            const isPast = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isFuture = index > currentStepIndex;

            return (
              <div key={step.status} className="flex flex-col items-center gap-1 flex-1">
                {/* Status dot */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isPast
                      ? "bg-gray-400 text-white"
                      : isCurrent
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-200"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isPast ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${isCurrent ? "bg-white" : "bg-current"}`}></div>
                  )}
                </div>
                {/* Label */}
                <div
                  className={`text-xs font-medium text-center ${
                    isCurrent
                      ? "text-indigo-600"
                      : isPast
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

