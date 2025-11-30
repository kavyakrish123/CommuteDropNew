"use client";

import { useState } from "react";

interface HelpTooltipProps {
  content: string;
  title?: string;
}

export function HelpTooltip({ content, title }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 rounded-full bg-[#EFFFEE] text-[#00C57E] flex items-center justify-center text-xs font-semibold hover:bg-[#00C57E] hover:text-white transition-colors"
        aria-label="Help"
      >
        ?
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-soft-lg shadow-card-lg p-4 z-50 border border-gray-200">
            {title && (
              <h3 className="font-semibold text-[#1A1A1A] mb-2">{title}</h3>
            )}
            <p className="text-sm text-[#666666] leading-relaxed">{content}</p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 text-xs text-[#00C57E] hover:text-[#00A869] font-semibold"
            >
              Got it
            </button>
          </div>
        </>
      )}
    </div>
  );
}

