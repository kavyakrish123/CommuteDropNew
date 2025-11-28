"use client";

import Link from "next/link";
import { DeliveryRequest } from "@/lib/types";
import { format } from "date-fns";

interface ActiveJobBannerProps {
  request: DeliveryRequest;
  isRider?: boolean;
}

export function ActiveJobBanner({ request, isRider = false }: ActiveJobBannerProps) {
  const getStatusText = () => {
    switch (request.status) {
      case "approved":
        return isRider ? "Go to pickup location" : "Rider is on the way";
      case "waiting_pickup":
      case "pickup_otp_pending":
        return isRider ? "Verify pickup OTP" : "Rider arrived at pickup";
      case "picked":
        return isRider ? "Start delivery" : "Item picked up";
      case "in_transit":
        return isRider ? "In transit to drop" : "Delivery in progress";
      default:
        return "Active";
    }
  };

  const getStatusColor = () => {
    switch (request.status) {
      case "approved":
      case "waiting_pickup":
      case "pickup_otp_pending":
        return "bg-yellow-500";
      case "picked":
      case "in_transit":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <Link
      href={`/requests/${request.id}`}
      className="block bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden mb-4 active:scale-[0.98] transition-transform"
    >
      {/* Status Bar */}
      <div className={`${getStatusColor()} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-white font-semibold text-sm">{getStatusText()}</span>
        </div>
        <span className="text-white text-xs font-medium">
          {request.status === "in_transit" ? "ETA: Soon" : "Tap to view"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Pickup Location */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium mb-0.5">PICKUP</p>
            <p className="text-base font-semibold text-gray-900 truncate">{request.pickupPincode}</p>
            {request.pickupDetails && (
              <p className="text-sm text-gray-600 truncate">{request.pickupDetails}</p>
            )}
          </div>
        </div>

        {/* Divider Line */}
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full" style={{ marginLeft: '-4px' }}></div>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Drop Location */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium mb-0.5">DROP OFF</p>
            <p className="text-base font-semibold text-gray-900 truncate">{request.dropPincode}</p>
            {request.dropDetails && (
              <p className="text-sm text-gray-600 truncate">{request.dropDetails}</p>
            )}
          </div>
        </div>

        {/* Item Info */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Item</p>
              <p className="text-sm font-medium text-gray-900 truncate">{request.itemDescription}</p>
            </div>
            {request.priceOffered && (
              <div className="ml-4 text-right">
                <p className="text-xs text-gray-500 mb-0.5">Price</p>
                <p className="text-base font-bold text-green-600">${request.priceOffered}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Status */}
        {request.status === "in_transit" && (
          <div className={`pt-3 border-t border-gray-100 ${request.paymentConfirmed ? "bg-green-50" : "bg-yellow-50"} rounded-lg p-2 mt-2`}>
            {request.paymentConfirmed ? (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-medium text-green-800">Payment confirmed</p>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs font-medium text-yellow-800">
                  Payment must be confirmed before delivery completion
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

