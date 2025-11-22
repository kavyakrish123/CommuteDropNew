"use client";

import { RequestStatus } from "@/lib/types";

interface ParcelTimelineProps {
  status: RequestStatus;
}

const STATUS_STEPS: Array<{ status: RequestStatus; label: string; description: string }> = [
  { status: "created", label: "Created", description: "Request posted" },
  { status: "accepted", label: "Accepted", description: "Rider accepted" },
  { status: "waiting_pickup", label: "Waiting Pickup", description: "Rider en route" },
  { status: "pickup_otp_pending", label: "Pickup OTP Pending", description: "Verify OTP" },
  { status: "picked", label: "Picked", description: "Item collected" },
  { status: "in_transit", label: "In Transit", description: "On the way" },
  { status: "delivered", label: "Delivered", description: "OTP verified" },
  { status: "completed", label: "Completed", description: "Delivery complete" },
];

export function ParcelTimeline({ status }: ParcelTimelineProps) {
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === status);
  const isCompleted = status === "completed" || status === "cancelled" || status === "expired";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Parcel Journey</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div
          className="absolute left-4 top-0 w-0.5 bg-indigo-600 transition-all duration-300"
          style={{
            height: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
          }}
        ></div>

        {/* Status steps */}
        <div className="space-y-6">
          {STATUS_STEPS.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.status} className="relative flex items-start gap-4">
                {/* Status dot */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isActive ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  )}
                </div>

                {/* Status content */}
                <div className="flex-1 pt-1">
                  <div
                    className={`font-medium ${
                      isActive ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-sm text-gray-600">{step.description}</div>
                  {isCurrent && !isCompleted && (
                    <div className="mt-1 text-xs text-indigo-600 font-medium">
                      Current Status
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

