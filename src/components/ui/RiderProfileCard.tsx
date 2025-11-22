"use client";

import { User } from "@/lib/types";
import Image from "next/image";
import { CommuteBadge } from "./CommuteBadge";

interface RiderProfileCardProps {
  rider: User;
  onApprove: () => void;
  onReject: () => void;
}

export function RiderProfileCard({ rider, onApprove, onReject }: RiderProfileCardProps) {
  const rating = rider.rating || 0;
  const totalDeliveries = rider.totalDeliveries || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        {rider.profileImage ? (
          <img
            src={rider.profileImage}
            alt={rider.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
            {rider.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900">{rider.name}</h3>
            <CommuteBadge commuteType={rider.commuteType} size="sm" />
          </div>
          {rider.bio && <p className="text-sm text-gray-600 mt-1">{rider.bio}</p>}
          
          <div className="mt-3 flex items-center gap-4">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-700">Rating:</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-1">
                  {rating.toFixed(1)} ({totalDeliveries} deliveries)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700"
        >
          Approve Rider
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

