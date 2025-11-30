"use client";

import { useState } from "react";
import { HelpTooltip } from "./HelpTooltip";

interface EducationBannerProps {
  title: string;
  content: string;
  type?: "info" | "warning" | "success";
  dismissible?: boolean;
}

export function EducationBanner({
  title,
  content,
  type = "info",
  dismissible = true,
}: EducationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const bgColors = {
    info: "bg-[#EFFFEE] border-[#00C57E]",
    warning: "bg-yellow-50 border-yellow-400",
    success: "bg-green-50 border-green-400",
  };

  const textColors = {
    info: "text-[#00C57E]",
    warning: "text-yellow-800",
    success: "text-green-800",
  };

  return (
    <div
      className={`${bgColors[type]} border-l-4 rounded-soft-lg p-4 mb-6`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className={`font-semibold ${textColors[type]} mb-1`}>{title}</h3>
          <p className="text-sm text-[#666666] leading-relaxed">{content}</p>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-[#666666] hover:text-[#1A1A1A] transition-colors"
            aria-label="Dismiss"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

