"use client";

import { useState } from "react";

interface RiderRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message?: string) => void;
  requestDescription?: string;
}

export function RiderRequestModal({
  isOpen,
  onClose,
  onConfirm,
  requestDescription,
}: RiderRequestModalProps) {
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(message.trim() || undefined);
    setMessage("");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-soft-lg shadow-card-lg max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#1A1A1A]">Request to Deliver</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Optional Message to Sender
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., I'm going through that route and will deliver with care..."
                rows={4}
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C57E] focus:border-transparent text-black font-bold resize-none"
                style={{ color: "#000000", fontWeight: 700 }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/200 characters
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Let the sender know why you're a good fit for this delivery
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#00C57E] text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-[#00A869] active:bg-[#00995A] transition-all duration-150 shadow-card"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

