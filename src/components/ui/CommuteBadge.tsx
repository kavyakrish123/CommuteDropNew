"use client";

import { CommuteType } from "@/lib/types";

interface CommuteBadgeProps {
  commuteType?: CommuteType;
  size?: "sm" | "md" | "lg";
}

export function CommuteBadge({ commuteType, size = "md" }: CommuteBadgeProps) {
  if (!commuteType || commuteType === "other") return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const getBadgeContent = () => {
    switch (commuteType) {
      case "mrt":
        return {
          icon: "🚇",
          text: "MRT",
          bgColor: "bg-blue-100 text-blue-700 border-blue-200",
        };
      case "bus":
        return {
          icon: "🚌",
          text: "Bus",
          bgColor: "bg-green-100 text-green-700 border-green-200",
        };
      case "both":
        return {
          icon: "🚇🚌",
          text: "MRT & Bus",
          bgColor: "bg-purple-100 text-purple-700 border-purple-200",
        };
      default:
        return null;
    }
  };

  const badge = getBadgeContent();
  if (!badge) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${badge.bgColor} ${sizeClasses[size]}`}
    >
      <span>{badge.icon}</span>
      <span>{badge.text}</span>
    </span>
  );
}

