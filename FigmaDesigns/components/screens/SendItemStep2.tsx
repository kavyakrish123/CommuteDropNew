import React from 'react';
import { ScreenWrapper } from './ScreenWrapper';

export function SendItemStep2() {
  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button className="mr-4">
          <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Step 2 of 5</h1>
      </div>
      
      {/* Progress Bar */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#00C57E] rounded-full" style={{ width: '40%' }}></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Pickup Location</h2>
          <p className="text-sm text-[#666666]">Where should the commuter pick up?</p>
        </div>
        
        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Postal Code
            </label>
            <input
              type="text"
              placeholder="123456"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-soft-lg focus:border-[#00C57E] focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              placeholder="e.g., Building name, unit number..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-soft-lg focus:border-[#00C57E] focus:outline-none resize-none"
              rows={3}
            />
          </div>
        </div>
        
        {/* Next Button */}
        <button className="w-full bg-[#00C57E] text-white py-4 rounded-soft-lg font-semibold shadow-card mt-auto">
          Next
        </button>
      </div>
    </ScreenWrapper>
  );
}

